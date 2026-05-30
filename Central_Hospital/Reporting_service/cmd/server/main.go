package main

import (
	"log"
	"net/http"

	_ "reporting_service/docs" // Import swagger docs
	"reporting_service/internal/api"
	"reporting_service/internal/config"
	"reporting_service/internal/db"
)

// @title Reporting Service API
// @version 1.0
// @description Backend service for generating department inventory reports
// @host localhost:7030
// @BasePath /api

func main() {
	// Cargar configuración
	cfg := config.LoadConfig()

	// Conectar a la base de datos
	db.ConnectDB(cfg)

	// Configurar los handlers con el config cargado
	api.SetConfig(cfg)

	// Configurar el enrutador
	router := api.SetupRouter()

	// Iniciar servidor
	port := ":7030" // Usar 7030 para reporting (inventory es 7010, auth es 7050)
	log.Printf("Starting Reporting Service on port %s", port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
