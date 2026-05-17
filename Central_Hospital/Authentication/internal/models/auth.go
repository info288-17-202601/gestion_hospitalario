package models

import "time"

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Rut          string `gorm:"type:varchar(20);not null"`
	Password     string `gorm:"type:varchar(255);not null"`
	Name         string `gorm:"type:varchar(255);not null"`
	LastName     string `gorm:"type:varchar(255);not null"`
	Email        string `gorm:"type:varchar(255);not null"`
	Phone        string `gorm:"type:varchar(20)"`
	Role         string `gorm:"type:varchar(50);not null"`
	DepartmentID uint
	IsActive     bool `gorm:"default:true"`
}

func (User) TableName() string { return "users" }

type RfidCard struct {
	ID       uint   `gorm:"primaryKey"`
	UserID   uint   `gorm:"not null"`
	Uid      string `gorm:"type:varchar(100);unique;not null"`
	IsActive bool   `gorm:"default:true"`
	User     User   `gorm:"foreignKey:UserID"`
}

func (RfidCard) TableName() string { return "rfid_cards" }

type UserPinCredential struct {
	ID      uint   `gorm:"primaryKey"`
	UserID  uint   `gorm:"unique;not null"`
	PinHash string `gorm:"type:varchar(255);not null"`
	User    User   `gorm:"foreignKey:UserID"`
}

func (UserPinCredential) TableName() string { return "user_pin_credentials" }

type AuthLog struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     *uint     
	AuthMethod string    `gorm:"type:varchar(50);not null"`
	UidAttempt string    `gorm:"type:varchar(100)"`
	Success    bool      `gorm:"not null"`
	Reason     string    `gorm:"type:text"`
	CreatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

func (AuthLog) TableName() string { return "auth_logs" }
