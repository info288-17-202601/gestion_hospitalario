package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"inventory_service/internal/config"
	"inventory_service/internal/models"
	"inventory_service/internal/schemas"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type InventoryService struct {
	db *gorm.DB
}

func NewInventoryService(db *gorm.DB) *InventoryService {
	return &InventoryService{db: db}
}

func (s *InventoryService) ProcessIngestion(item schemas.SupplyItem) bool {
	log.Printf("Processing legacy ingestion for item %s", item.ID)
	return true
}

func (s *InventoryService) ModifyStock(req schemas.StockModificationRequest) (*models.InventoryMovement, error) {
	cfg, _ := config.LoadConfig()
	departmentID := cfg.DepartmentID

	var department models.Department
	if err := s.db.First(&department, departmentID).Error; err != nil {
		return nil, errors.New("Department not found")
	}

	var supply models.Supply
	if err := s.db.First(&supply, req.SupplyID).Error; err != nil {
		return nil, errors.New("Supply not found")
	}

	var inventory models.DepartmentInventory
	err := s.db.Where("department_id = ? AND supply_id = ?", departmentID, req.SupplyID).First(&inventory).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			inventory = models.DepartmentInventory{
				DepartmentID: departmentID,
				SupplyID:     req.SupplyID,
				Quantity:     0,
			}
			if err := s.db.Create(&inventory).Error; err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	newQuantity := inventory.Quantity + req.QuantityChange
	if newQuantity < 0 {
		return nil, errors.New("Insufficient stock for this operation")
	}

	inventory.Quantity = newQuantity
	if err := s.db.Save(&inventory).Error; err != nil {
		return nil, err
	}

	// Check if the stock drops below the minimum limit set in the database
	if newQuantity < supply.MinimumStock {
		go s.publishAlert(supply, department, newQuantity)
	}

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

	if err := s.db.Create(&movement).Error; err != nil {
		return nil, err
	}

	return &movement, nil
}

func (s *InventoryService) RegisterMovement(req schemas.MovementRequest) (*models.InventoryMovement, error) {
	if req.OriginDepartmentID == req.DestinationDepartmentID {
		return nil, errors.New("Origin and destination must be different")
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var originInv models.DepartmentInventory
	if err := tx.Where("department_id = ? AND supply_id = ?", req.OriginDepartmentID, req.SupplyID).First(&originInv).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("Insufficient stock in origin department")
	}

	if originInv.Quantity < req.Quantity {
		tx.Rollback()
		return nil, errors.New("Insufficient stock in origin department")
	}

	var destInv models.DepartmentInventory
	if err := tx.Where("department_id = ? AND supply_id = ?", req.DestinationDepartmentID, req.SupplyID).First(&destInv).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			destInv = models.DepartmentInventory{
				DepartmentID: req.DestinationDepartmentID,
				SupplyID:     req.SupplyID,
				Quantity:     0,
			}
			if err := tx.Create(&destInv).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			tx.Rollback()
			return nil, err
		}
	}

	originInv.Quantity -= req.Quantity
	destInv.Quantity += req.Quantity

	if err := tx.Save(&originInv).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Save(&destInv).Error; err != nil {
		tx.Rollback()
		return nil, err
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

	if err := tx.Create(&movement).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Check if the stock of origin department drops below the minimum limit after successful transfer
	var supply models.Supply
	if err := s.db.First(&supply, req.SupplyID).Error; err == nil {
		if originInv.Quantity < supply.MinimumStock {
			var department models.Department
			if err := s.db.First(&department, req.OriginDepartmentID).Error; err == nil {
				go s.publishAlert(supply, department, originInv.Quantity)
			}
		}
	}

	return &movement, nil
}

// publishAlert connects to RabbitMQ and publishes a low stock alert asynchronously.
func (s *InventoryService) publishAlert(supply models.Supply, department models.Department, currentQty float64) {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Printf("[Alert] Failed to load config for RabbitMQ: %v", err)
		return
	}

	// Connect to RabbitMQ
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		log.Printf("[Alert] Failed to connect to RabbitMQ URL (%s): %v", cfg.RabbitMQURL, err)
		return
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Printf("[Alert] Failed to open RabbitMQ channel: %v", err)
		return
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		cfg.RabbitMQQueue, // queue name
		true,              // durable
		false,             // auto-delete
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		log.Printf("[Alert] Failed to declare queue (%s): %v", cfg.RabbitMQQueue, err)
		return
	}

	// Create descriptive alert warning string in English
	messageText := fmt.Sprintf("LOW STOCK WARNING: Supply '%s' (Code: %s) has dropped below the minimum limit in department '%s'. Current: %.2f, Minimum: %.2f",
		supply.Name, supply.InternalCode, department.Name, currentQty, supply.MinimumStock)

	payload := map[string]interface{}{
		"type":          "low_stock",
		"message":       messageText,
		"supply_id":     supply.ID,
		"department_id": department.ID,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[Alert] Failed to marshal alert payload: %v", err)
		return
	}

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		log.Printf("[Alert] Failed to publish message to RabbitMQ: %v", err)
		return
	}

	log.Printf("[Alert] Stock warning published successfully for supply %s", supply.Name)
}
// GetCategories returns all supply categories.
func (s *InventoryService) GetCategories() ([]models.SupplyCategory, error) {
	var categories []models.SupplyCategory

	if err := s.db.Find(&categories).Error; err != nil {
		return nil, err
	}

	return categories, nil
}

// GetSupplies returns all supplies.
func (s *InventoryService) GetSupplies() ([]models.Supply, error) {
	var supplies []models.Supply

	if err := s.db.Find(&supplies).Error; err != nil {
		return nil, err
	}

	return supplies, nil
}

// GetDepartmentStock returns the stock of the department configured in DEPARTMENT_ID.
func (s *InventoryService) GetDepartmentStock() ([]models.DepartmentInventory, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, err
	}

	departmentID := cfg.DepartmentID

	var inventory []models.DepartmentInventory

	if err := s.db.
		Where("department_id = ?", departmentID).
		Find(&inventory).Error; err != nil {
		return nil, err
	}

	return inventory, nil
}

// GetMovements returns all movements related to the configured department.
func (s *InventoryService) GetMovements() ([]models.InventoryMovement, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, err
	}

	departmentID := cfg.DepartmentID

	var movements []models.InventoryMovement

	if err := s.db.
		Where("origin_department_id = ? OR destination_department_id = ?", departmentID, departmentID).
		Order("movement_date DESC").
		Find(&movements).Error; err != nil {
		return nil, err
	}

	return movements, nil
}