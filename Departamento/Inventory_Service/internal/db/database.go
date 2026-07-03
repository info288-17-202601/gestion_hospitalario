package db

import (
	"fmt"
	"log"

	"inventory_service/internal/config"
	"inventory_service/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB        *gorm.DB // SQLite local database
	CentralDB *gorm.DB // Central PostgreSQL database
)

func InitDB(cfg *config.Settings) error {
	var err error

	// 1. Initialize local SQLite database
	log.Printf("Connecting to local SQLite database at: %s", cfg.SQLiteDBPath)
	DB, err = gorm.Open(sqlite.Open(cfg.SQLiteDBPath), &gorm.Config{})
	if err != nil {
		return err
	}

	// Automigrate SQLite local tables
	err = DB.AutoMigrate(
		&models.SupplyCategory{},
		&models.Department{},
		&models.Supply{},
		&models.DepartmentInventory{},
		&models.InventoryMovement{},
		&models.SyncQueueEvent{},
		&models.SyncMetadata{},
	)
	if err != nil {
		log.Printf("Failed to run SQLite auto-migrations: %v", err)
		return err
	}

	// Ensure the configured department exists locally as a fallback
	var count int64
	DB.Model(&models.Department{}).Where("id = ?", cfg.DepartmentID).Count(&count)
	if count == 0 {
		log.Printf("Seeding default local department record for ID %d", cfg.DepartmentID)
		DB.Create(&models.Department{
			ID:       cfg.DepartmentID,
			Name:     fmt.Sprintf("Department %d", cfg.DepartmentID),
			Location: "Local Node",
			IsActive: true,
		})
	}

	// 2. Attempt to initialize Central PostgreSQL database
	dsn := cfg.DatabaseURL()
	log.Printf("Attempting connection to Central PostgreSQL database at: %s:%s", cfg.PostgresServer, cfg.PostgresPort)
	CentralDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("[Warning] Failed to connect to Central PostgreSQL: %v. Running in offline mode.", err)
	} else {
		log.Println("Successfully connected to Central PostgreSQL database.")
	}

	return nil
}

func GetDB() *gorm.DB {
	return DB
}

func GetCentralDB() *gorm.DB {
	return CentralDB
}

func SetCentralDB(db *gorm.DB) {
	CentralDB = db
}
