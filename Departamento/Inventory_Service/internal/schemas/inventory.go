package schemas

import "time"

type SupplyItem struct {
    ID           string    `json:"id" binding:"required"`
    Name         string    `json:"name" binding:"required"`
    Category     string    `json:"category" binding:"required"`
    Quantity     int       `json:"quantity" binding:"required,gte=0"`
    Threshold    int       `json:"threshold"`
    DepartmentID string    `json:"department_id" binding:"required"`
    LastUpdated  time.Time `json:"last_updated"`
}

type IngestionResponse struct {
    Message string `json:"message"`
    ItemID  string `json:"item_id"`
    Status  string `json:"status"`
}

type StockModificationRequest struct {
    SupplyID       uint    `json:"supply_id" binding:"required"`
    QuantityChange float64 `json:"quantity_change" binding:"required"`
    Observations   string  `json:"observations"`
    UserID         uint    `json:"user_id" binding:"required"`
}

type MovementRequest struct {
    SupplyID                uint    `json:"supply_id" binding:"required"`
    Quantity                float64 `json:"quantity" binding:"required,gt=0"`
    OriginDepartmentID      uint    `json:"origin_department_id" binding:"required"`
    DestinationDepartmentID uint    `json:"destination_department_id" binding:"required"`
    Observations            string  `json:"observations"`
    UserID                  uint    `json:"user_id" binding:"required"`
}

type OperationResponse struct {
    Message    string `json:"message"`
    Status     string `json:"status"`
    MovementID *uint  `json:"movement_id,omitempty"`
}
type CreateSupplyRequest struct {
	InternalCode  string  `json:"internal_code" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	UnitOfMeasure string  `json:"unit_of_measure"`
	MinimumStock  float64 `json:"minimum_stock" binding:"required"`
	CategoryID    uint    `json:"category_id"`
	IsActive       bool    `json:"is_active"`
}

type UpdateSupplyRequest struct {
	InternalCode  string  `json:"internal_code"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	UnitOfMeasure string  `json:"unit_of_measure"`
	MinimumStock  float64 `json:"minimum_stock"`
	CategoryID    uint    `json:"category_id"`
	IsActive       *bool   `json:"is_active"`
}
