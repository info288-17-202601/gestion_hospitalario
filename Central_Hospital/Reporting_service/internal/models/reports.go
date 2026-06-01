package models

import "time"

// CriticalStockReport representa un item con stock bajo
type CriticalStockReport struct {
	Department   string  `json:"department"`
	InternalCode string  `json:"internal_code"`
	SupplyName   string  `json:"supply_name"`
	CurrentStock float64 `json:"current_stock"`
	MinimumStock float64 `json:"minimum_stock"`
}

// MonthlyConsumptionReport representa el consumo de un insumo
type MonthlyConsumptionReport struct {
	InternalCode  string  `json:"internal_code"`
	SupplyName    string  `json:"supply_name"`
	TotalConsumed float64 `json:"total_consumed"`
}

// TraceabilityReport representa el movimiento de un insumo
type TraceabilityReport struct {
	MovementDate time.Time `json:"movement_date"`
	Type         string    `json:"type"`
	Quantity     float64   `json:"quantity"`
	Responsable  string    `json:"responsable"`
	Origen       string    `json:"origen"`
	Destino      string    `json:"destino"`
	Observations string    `json:"observations"`
}

// ActiveAlertReport representa una alerta activa
type ActiveAlertReport struct {
	SupplyName string    `json:"supply_name"`
	Type       string    `json:"type"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

// DepartmentInventoryReport representa el inventario de un departamento
type DepartmentInventoryReport struct {
	ID           int     `json:"id"`
	DepartmentID int     `json:"department_id"`
	SupplyID     int     `json:"supply_id"`
	Quantity     float64 `json:"quantity"`
	MinimumStock float64 `json:"minimum_stock"`
}

type Department struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Location string `json:"location"`
	IsActive bool   `json:"is_active"`
}

type Supply struct {
	ID            int     `json:"id"`
	InternalCode  string  `json:"internal_code"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	UnitOfMeasure string  `json:"unit_of_measure"`
	MinimumStock  float64 `json:"minimum_stock"`
	CategoryID    int     `json:"category_id"`
	IsActive      bool    `json:"is_active"`
}

type Category struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
