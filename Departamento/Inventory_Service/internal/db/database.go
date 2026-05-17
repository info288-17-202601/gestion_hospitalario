package db

import (
    "inventory_service/internal/config"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Settings) error {
    var err error
    dsn := cfg.DatabaseURL()
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return err
    }
    return nil
}

func GetDB() *gorm.DB {
    return DB
}
