package db

import (
	"authentication_service/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbInstance *gorm.DB

func InitDB(cfg *config.Settings) error {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL()), &gorm.Config{})
	if err != nil {
		return err
	}
	dbInstance = db
	return nil
}

func GetDB() *gorm.DB {
	return dbInstance
}
