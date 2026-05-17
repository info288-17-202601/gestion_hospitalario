package main

import (
	"log"
	"os"

	"authentication_service/internal/api"
	"authentication_service/internal/config"
	"authentication_service/internal/db"

	_ "authentication_service/docs"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Authentication Service API
// @version 1.0
// @description API for Hospital user authentication (Dual Login).
// @host localhost:7050
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

	log.Printf("Starting %s on :7050", cfg.ProjectName)
	if err := router.Run(":7050"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
