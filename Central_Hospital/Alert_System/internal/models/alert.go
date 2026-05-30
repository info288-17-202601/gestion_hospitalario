package models

import "time"

type Alert struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Type         string    `gorm:"type:varchar(50);not null" json:"type"`
	Message      string    `gorm:"type:text;not null" json:"message"`
	CreatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	Status       string    `gorm:"type:varchar(20);default:'PENDING'" json:"status"` // PENDING, REVIEWED, RESOLVED
	SupplyID     *uint     `gorm:"column:supply_id" json:"supply_id"`
	DepartmentID *uint     `gorm:"column:department_id" json:"department_id"`
}

func (Alert) TableName() string {
	return "alerts"
}
