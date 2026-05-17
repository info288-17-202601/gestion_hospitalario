package services

import (
    "errors"
    "log"
    "inventory_service/internal/models"
    "inventory_service/internal/schemas"
    "inventory_service/internal/config"
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

    return &movement, nil
}
