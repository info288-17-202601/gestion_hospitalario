package models

import "time"

type SyncQueueEvent struct {
	ID         uint      `gorm:"primaryKey"`
	ActionType string    `gorm:"type:varchar(50);not null"` // e.g. "modify_stock", "register_movement"
	Payload    string    `gorm:"type:text;not null"`        // JSON serialized request/payload
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	Attempts   int       `gorm:"default:0"`
	Status     string    `gorm:"type:varchar(20);default:'pending'"` // e.g. "pending", "failed"
}

func (SyncQueueEvent) TableName() string { return "sync_queue" }

type SyncMetadata struct {
	Key       string    `gorm:"primaryKey;type:varchar(100)"`
	Value     string    `gorm:"type:text;not null"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (SyncMetadata) TableName() string { return "sync_metadata" }
