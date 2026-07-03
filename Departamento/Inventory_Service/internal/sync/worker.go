package sync

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"inventory_service/internal/config"
	"inventory_service/internal/db"
	"inventory_service/internal/models"
	"inventory_service/internal/schemas"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var ForceSyncChan = make(chan struct{}, 1)

func TriggerSync() {
	select {
	case ForceSyncChan <- struct{}{}:
		log.Println("[Sync] Triggered manual synchronization.")
	default:
		// Channel buffer is full, sync is already pending, no need to block
	}
}

func getDurationUntil(targetTime string) (time.Duration, error) {
	parts := strings.Split(targetTime, ":")
	if len(parts) != 2 {
		return 0, fmt.Errorf("invalid time format, expected HH:MM")
	}
	hour, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, err
	}
	minute, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, err
	}

	now := time.Now()
	target := time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())

	if target.Before(now) {
		target = target.Add(24 * time.Hour)
	}

	return target.Sub(now), nil
}

type SyncWorker struct {
	cfg *config.Settings
}

func NewSyncWorker(cfg *config.Settings) *SyncWorker {
	return &SyncWorker{cfg: cfg}
}

func (w *SyncWorker) Start(ctx context.Context) {
	log.Printf("Starting background sync worker with fixed-time policy at: %s", w.cfg.SyncTime)

	var dailyTimer *time.Timer
	var timerChan <-chan time.Time

	setupTimer := func() {
		duration, err := getDurationUntil(w.cfg.SyncTime)
		if err != nil {
			log.Printf("[Sync Worker] Error parsing SYNC_TIME '%s': %v. Defaulting to 23:00.", w.cfg.SyncTime, err)
			duration, _ = getDurationUntil("23:00")
		}
		log.Printf("[Sync Worker] Next scheduled sync in %v", duration)
		dailyTimer = time.NewTimer(duration)
		timerChan = dailyTimer.C
	}

	setupTimer()
	defer func() {
		if dailyTimer != nil {
			dailyTimer.Stop()
		}
	}()

	// Run initial sync on startup
	w.reconnectCentralIfNeeded()
	w.SyncUp()
	w.SyncDown()

	for {
		select {
		case <-ctx.Done():
			log.Println("Stopping sync worker...")
			return
		case <-timerChan:
			log.Println("[Sync Worker] Scheduled fixed-time sync triggered.")
			w.reconnectCentralIfNeeded()
			w.SyncUp()
			w.SyncDown()
			setupTimer()
		case <-ForceSyncChan:
			log.Println("[Sync Worker] Forced sync triggered by event.")
			w.reconnectCentralIfNeeded()
			w.SyncUp()
			w.SyncDown()
		}
	}
}

func (w *SyncWorker) reconnectCentralIfNeeded() {
	if db.GetCentralDB() != nil {
		// Test connection
		sqlDB, err := db.GetCentralDB().DB()
		if err == nil && sqlDB.Ping() == nil {
			return
		}
	}

	// Try to connect
	dsn := w.cfg.DatabaseURL()
	centralDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("[Sync Reconnect] Failed to connect to Central PostgreSQL: %v", err)
		return
	}
	db.SetCentralDB(centralDB)
	log.Println("[Sync Reconnect] Successfully re-connected to Central PostgreSQL.")
}

func (w *SyncWorker) SyncUp() {
	centralDB := db.GetCentralDB()
	if centralDB == nil {
		log.Println("[Sync Up] Skipped: Central database not connected.")
		return
	}

	localDB := db.GetDB()
	var events []models.SyncQueueEvent

	// Fetch pending events from SQLite local DB
	err := localDB.Where("status = ? AND attempts < 5", "pending").Order("id asc").Limit(50).Find(&events).Error
	if err != nil {
		log.Printf("[Sync Up] Error reading local queue: %v", err)
		return
	}

	if len(events) == 0 {
		return
	}

	log.Printf("[Sync Up] Found %d events to synchronize.", len(events))

	// Run batch operations inside a transaction in Central DB
	txCentral := centralDB.Begin()
	if txCentral.Error != nil {
		log.Printf("[Sync Up] Error starting Central transaction: %v", txCentral.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			txCentral.Rollback()
		}
	}()

	var syncedIDs []uint
	var failedIDs []uint

	for _, event := range events {
		var syncErr error

		switch event.ActionType {
		case "modify_stock":
			var req schemas.StockModificationRequest
			if err := json.Unmarshal([]byte(event.Payload), &req); err != nil {
				syncErr = fmt.Errorf("failed to unmarshal payload: %v", err)
				break
			}
			syncErr = w.applyModifyStockCentral(txCentral, req)

		case "register_movement":
			var req schemas.MovementRequest
			if err := json.Unmarshal([]byte(event.Payload), &req); err != nil {
				syncErr = fmt.Errorf("failed to unmarshal payload: %v", err)
				break
			}
			syncErr = w.applyRegisterMovementCentral(txCentral, req)

		default:
			syncErr = fmt.Errorf("unknown action type: %s", event.ActionType)
		}

		if syncErr != nil {
			log.Printf("[Sync Up] Event ID %d failed to sync: %v", event.ID, syncErr)
			failedIDs = append(failedIDs, event.ID)
			break
		} else {
			syncedIDs = append(syncedIDs, event.ID)
		}
	}

	if len(failedIDs) > 0 {
		txCentral.Rollback()
		// Increment attempts for failed event
		localDB.Model(&models.SyncQueueEvent{}).Where("id = ?", failedIDs[0]).
			Updates(map[string]interface{}{
				"attempts": gorm.Expr("attempts + 1"),
				"status":   "failed",
			})
		log.Printf("[Sync Up] Batch aborted. Incremented attempts for failing event ID %d.", failedIDs[0])
		return
	}

	if err := txCentral.Commit().Error; err != nil {
		log.Printf("[Sync Up] Error committing Central transaction: %v", err)
		return
	}

	// Delete successfully synced events from local SQLite DB
	if len(syncedIDs) > 0 {
		if err := localDB.Where("id IN ?", syncedIDs).Delete(&models.SyncQueueEvent{}).Error; err != nil {
			log.Printf("[Sync Up] Error deleting local events: %v", err)
		} else {
			log.Printf("[Sync Up] Successfully synchronized %d events.", len(syncedIDs))
		}
	}
}

func (w *SyncWorker) applyModifyStockCentral(tx *gorm.DB, req schemas.StockModificationRequest) error {
	departmentID := w.cfg.DepartmentID

	// Verify department exists
	var dept models.Department
	if err := tx.First(&dept, departmentID).Error; err != nil {
		return fmt.Errorf("department %d not found in Central: %v", departmentID, err)
	}

	// Verify supply exists
	var supply models.Supply
	if err := tx.First(&supply, req.SupplyID).Error; err != nil {
		return fmt.Errorf("supply %d not found in Central: %v", req.SupplyID, err)
	}

	// Find or create Central inventory row
	var inventory models.DepartmentInventory
	err := tx.Where("department_id = ? AND supply_id = ?", departmentID, req.SupplyID).First(&inventory).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			inventory = models.DepartmentInventory{
				DepartmentID: departmentID,
				SupplyID:     req.SupplyID,
				Quantity:     0,
			}
			if err := tx.Create(&inventory).Error; err != nil {
				return err
			}
		} else {
			return err
		}
	}

	// Check sufficiency if decreasing
	newQty := inventory.Quantity + req.QuantityChange
	if newQty < 0 {
		return fmt.Errorf("insufficient stock in Central for department %d: current=%.2f, change=%.2f",
			departmentID, inventory.Quantity, req.QuantityChange)
	}

	inventory.Quantity = newQty
	if err := tx.Save(&inventory).Error; err != nil {
		return err
	}

	// Record movement in Central
	movementType := "salida"
	if req.QuantityChange > 0 {
		movementType = "entrada"
	}

	absQty := req.QuantityChange
	if absQty < 0 {
		absQty = -absQty
	}

	var originID *uint
	var destID *uint
	if req.QuantityChange < 0 {
		originID = &departmentID
	} else {
		destID = &departmentID
	}

	movement := models.InventoryMovement{
		Type:                    movementType,
		Quantity:                absQty,
		Observations:            req.Observations,
		UserID:                  req.UserID,
		SupplyID:                req.SupplyID,
		OriginDepartmentID:      originID,
		DestinationDepartmentID: destID,
	}

	return tx.Create(&movement).Error
}

func (w *SyncWorker) applyRegisterMovementCentral(tx *gorm.DB, req schemas.MovementRequest) error {
	// Origin department inventory
	var originInv models.DepartmentInventory
	if err := tx.Where("department_id = ? AND supply_id = ?", req.OriginDepartmentID, req.SupplyID).First(&originInv).Error; err != nil {
		return fmt.Errorf("origin department inventory not found: %v", err)
	}

	if originInv.Quantity < req.Quantity {
		return fmt.Errorf("insufficient stock in Central origin department %d: current=%.2f, requested=%.2f",
			req.OriginDepartmentID, originInv.Quantity, req.Quantity)
	}

	// Destination department inventory
	var destInv models.DepartmentInventory
	err := tx.Where("department_id = ? AND supply_id = ?", req.DestinationDepartmentID, req.SupplyID).First(&destInv).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			destInv = models.DepartmentInventory{
				DepartmentID: req.DestinationDepartmentID,
				SupplyID:     req.SupplyID,
				Quantity:     0,
			}
			if err := tx.Create(&destInv).Error; err != nil {
				return err
			}
		} else {
			return err
		}
	}

	// Apply stock transfers in Central
	originInv.Quantity -= req.Quantity
	destInv.Quantity += req.Quantity

	if err := tx.Save(&originInv).Error; err != nil {
		return err
	}
	if err := tx.Save(&destInv).Error; err != nil {
		return err
	}

	movement := models.InventoryMovement{
		Type:                    "transferencia",
		Quantity:                req.Quantity,
		Observations:            req.Observations,
		UserID:                  req.UserID,
		SupplyID:                req.SupplyID,
		OriginDepartmentID:      &req.OriginDepartmentID,
		DestinationDepartmentID: &req.DestinationDepartmentID,
	}

	return tx.Create(&movement).Error
}

func (w *SyncWorker) SyncDown() {
	centralDB := db.GetCentralDB()
	if centralDB == nil {
		log.Println("[Sync Down] Skipped: Central database not connected.")
		return
	}

	localDB := db.GetDB()

	// 1. Sync Catalog (Categories, Supplies, Departments)
	w.syncCatalog(centralDB, localDB)

	// 2. Sync Stock and External Movements
	w.syncIncomingMovementsAndStock(centralDB, localDB)
}

func (w *SyncWorker) syncCatalog(centralDB *gorm.DB, localDB *gorm.DB) {
	// Sync Categories
	var categories []models.SupplyCategory
	if err := centralDB.Find(&categories).Error; err == nil {
		for _, cat := range categories {
			localDB.Save(&cat)
		}
	}

	// Sync Supplies
	var supplies []models.Supply
	if err := centralDB.Find(&supplies).Error; err == nil {
		for _, sup := range supplies {
			localDB.Save(&sup)
		}
	}

	// Sync Departments
	var departments []models.Department
	if err := centralDB.Find(&departments).Error; err == nil {
		for _, dept := range departments {
			localDB.Save(&dept)
		}
	}
}

func (w *SyncWorker) syncIncomingMovementsAndStock(centralDB *gorm.DB, localDB *gorm.DB) {
	departmentID := w.cfg.DepartmentID

	// Get last processed movement ID from local DB
	var meta models.SyncMetadata
	lastMovID := uint(0)
	if err := localDB.Where("key = ?", "last_processed_movement_id").First(&meta).Error; err == nil {
		if val, err := strconv.ParseUint(meta.Value, 10, 64); err == nil {
			lastMovID = uint(val)
		}
	}

	// Query movements from Central where:
	// - origin or destination matches our departmentID
	// - AND ID > lastMovID
	var movements []models.InventoryMovement
	err := centralDB.
		Where("(origin_department_id = ? OR destination_department_id = ?) AND id > ?", departmentID, departmentID, lastMovID).
		Order("id asc").
		Find(&movements).Error

	if err != nil {
		log.Printf("[Sync Down] Failed to query new movements from Central: %v", err)
		return
	}

	if len(movements) == 0 {
		return
	}

	log.Printf("[Sync Down] Downloading %d new movements/state changes from Central.", len(movements))

	txLocal := localDB.Begin()
	if txLocal.Error != nil {
		log.Printf("[Sync Down] Failed to start local transaction: %v", txLocal.Error)
		return
	}
	defer func() {
		if r := recover(); r != nil {
			txLocal.Rollback()
		}
	}()

	maxID := lastMovID
	for _, m := range movements {
		// 1. Insert/Save movement locally
		if err := txLocal.Save(&m).Error; err != nil {
			txLocal.Rollback()
			log.Printf("[Sync Down] Failed to save movement %d locally: %v", m.ID, err)
			return
		}

		// 2. Adjust local inventory if it affects this department and wasn't initiated by us
		if m.DestinationDepartmentID != nil && *m.DestinationDepartmentID == departmentID {
			if m.OriginDepartmentID == nil || *m.OriginDepartmentID != departmentID {
				// This is an incoming transfer from another department! Update local stock.
				var inventory models.DepartmentInventory
				err := txLocal.Where("department_id = ? AND supply_id = ?", departmentID, m.SupplyID).First(&inventory).Error
				if err != nil {
					if errors.Is(err, gorm.ErrRecordNotFound) {
						inventory = models.DepartmentInventory{
							DepartmentID: departmentID,
							SupplyID:     m.SupplyID,
							Quantity:     m.Quantity,
						}
						if err := txLocal.Create(&inventory).Error; err != nil {
							txLocal.Rollback()
							log.Printf("[Sync Down] Failed to create local inventory: %v", err)
							return
						}
					} else {
						txLocal.Rollback()
						log.Printf("[Sync Down] Failed to query local inventory: %v", err)
						return
					}
				} else {
					inventory.Quantity += m.Quantity
					if err := txLocal.Save(&inventory).Error; err != nil {
						txLocal.Rollback()
						log.Printf("[Sync Down] Failed to save local inventory: %v", err)
						return
					}
				}
				log.Printf("[Sync Down] Applied remote incoming transfer: added %.2f of supply %d to local inventory.", m.Quantity, m.SupplyID)
			}
		}

		if m.ID > maxID {
			maxID = m.ID
		}
	}

	// Update last processed ID metadata
	meta.Key = "last_processed_movement_id"
	meta.Value = strconv.FormatUint(uint64(maxID), 10)
	if err := txLocal.Save(&meta).Error; err != nil {
		txLocal.Rollback()
		log.Printf("[Sync Down] Failed to update sync metadata: %v", err)
		return
	}

	if err := txLocal.Commit().Error; err != nil {
		log.Printf("[Sync Down] Failed to commit local transaction: %v", err)
		return
	}

	log.Printf("[Sync Down] Successfully processed movements up to Central ID %d.", maxID)
}
