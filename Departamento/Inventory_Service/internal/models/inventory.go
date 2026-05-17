package models

import (
    "time"
)

type SupplyCategory struct {
    ID          uint      `gorm:"primaryKey"`
    Name        string    `gorm:"type:varchar(255);not null"`
    Description string    `gorm:"type:text"`
    Supplies    []Supply  `gorm:"foreignKey:CategoryID"`
}

func (SupplyCategory) TableName() string { return "supply_category" }

type Department struct {
    ID                 uint                  `gorm:"primaryKey"`
    Name               string                `gorm:"type:varchar(255);not null"`
    Location           string                `gorm:"type:varchar(255);not null"`
    IsActive           bool                  `gorm:"default:true"`
    Inventory          []DepartmentInventory `gorm:"foreignKey:DepartmentID"`
}

func (Department) TableName() string { return "departments" }

type Supply struct {
    ID                  uint                  `gorm:"primaryKey"`
    InternalCode        string                `gorm:"type:varchar(50);not null;unique"`
    Name                string                `gorm:"type:varchar(255);not null"`
    Description         string                `gorm:"type:text"`
    UnitOfMeasure       string                `gorm:"type:varchar(50)"`
    MinimumStock        float64               `gorm:"type:numeric(10,2);not null"`
    CategoryID          uint
    IsActive            bool                  `gorm:"default:true"`
    Category            SupplyCategory        `gorm:"foreignKey:CategoryID"`
    DepartmentInventory []DepartmentInventory `gorm:"foreignKey:SupplyID"`
    Movements           []InventoryMovement   `gorm:"foreignKey:SupplyID"`
}

func (Supply) TableName() string { return "supplies" }

type DepartmentInventory struct {
    ID           uint       `gorm:"primaryKey"`
    DepartmentID uint
    SupplyID     uint
    Quantity     float64    `gorm:"type:numeric(10,2);not null;default:0"`
    UpdatedAt    time.Time  `gorm:"autoUpdateTime"`
    Department   Department `gorm:"foreignKey:DepartmentID"`
    Supply       Supply     `gorm:"foreignKey:SupplyID"`
}

func (DepartmentInventory) TableName() string { return "department_inventory" }

type InventoryMovement struct {
    ID                      uint        `gorm:"primaryKey"`
    Type                    string      `gorm:"type:varchar(50);not null"` // e.g. "entrada", "salida", "transferencia"
    Quantity                float64     `gorm:"type:numeric(10,2);not null"`
    MovementDate            time.Time   `gorm:"autoCreateTime"`
    Observations            string      `gorm:"type:text"`
    UserID                  uint
    SupplyID                uint
    OriginDepartmentID      *uint
    DestinationDepartmentID *uint

    Supply                Supply      `gorm:"foreignKey:SupplyID"`
    OriginDepartment      *Department `gorm:"foreignKey:OriginDepartmentID"`
    DestinationDepartment *Department `gorm:"foreignKey:DestinationDepartmentID"`
}

func (InventoryMovement) TableName() string { return "inventory_movements" }
