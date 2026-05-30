package main

import (
	"inventory_service/internal/api"
	"inventory_service/internal/config"
	"inventory_service/internal/db"
	"log"
	"os"

	_ "inventory_service/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Inventory Service API
// @version 1.0
// @description API for the Hospital's inventory management.
// @host localhost:7010
// @BasePath /api/v1
func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := db.InitDB(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := api.SetupRouter()

	if os.Getenv("GIN_MODE") != "release" {
		router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	log.Printf("Starting %s on :7010", cfg.ProjectName)
	if err := router.Run(":7010"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
