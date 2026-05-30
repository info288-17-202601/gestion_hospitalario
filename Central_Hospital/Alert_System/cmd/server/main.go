package main

import (
	"log"

	"alert_system/internal/api"
	"alert_system/internal/api/handlers"
	"alert_system/internal/config"
	"alert_system/internal/db"
	"alert_system/internal/services"
)

// @title Alert System Service API
// @version 1.0
// @description Microservice in Go for hospital real-time alerting, database persistence, and WebSocket notifications.
// @host localhost:7030
// @BasePath /api/v1
func main() {
	// Load Configurations
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[Main] Failed to load configuration settings: %v", err)
	}

	// Initialize PostgreSQL GORM connection
	if err := db.InitDB(cfg); err != nil {
		log.Fatalf("[Main] Failed to initialize database: %v", err)
	}
	log.Println("[Main] Database connection pool initialized successfully")

	// Instantiate Core Services
	wsService := services.NewWebSocketService()
	alertService := services.NewAlertService(db.GetDB(), cfg, wsService)

	// Start Background Processes

	// Start WebSocket Hub dispatcher loop
	go wsService.Run()
	log.Println("[Main] WebSocket Broadcast Hub started in background")

	// Start RabbitMQ queue listener worker
	go alertService.StartConsuming(cfg.RabbitMQQueue)
	log.Println("[Main] RabbitMQ consumer worker spawned in background")

	// Setup Router & Start Server
	handler := handlers.NewAlertHandler(alertService, wsService)
	router := api.SetupRouter(handler)

	port := ":" + cfg.Port
	log.Printf("[Main] Starting %s on %s", cfg.ProjectName, port)
	if err := router.Run(port); err != nil {
		log.Fatalf("[Main] Failed to start HTTP server: %v", err)
	}
}

type main_dummy struct{} // To satisfy linters if any
