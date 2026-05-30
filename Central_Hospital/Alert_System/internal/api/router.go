package api

import (
	"os"

	"alert_system/internal/api/handlers"

	_ "alert_system/docs"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(handler *handlers.AlertHandler) *gin.Engine {
	router := gin.Default()

	// Global Health Endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "Alert System Service",
		})
	})

	// Local development swagger route - disabled in production release mode
	if os.Getenv("GIN_MODE") != "release" {
		router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	apiV1 := router.Group("/api/v1")
	{
		alert := apiV1.Group("/alert")
		{
			// WebSocket upgrade endpoint
			alert.GET("/ws", handler.ServeWS)

			// REST endpoints for fetching alerts and updating status
			alert.GET("", handler.GetAlerts)
			alert.GET("/", handler.GetAlerts)
			alert.PUT("/:id/status", handler.UpdateAlertStatus)

			// Swagger route under reverse-proxy mapped path - disabled in production release mode
			if os.Getenv("GIN_MODE") != "release" {
				alert.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
			}
		}
	}

	// CORS Policies matching Authentication configurations
	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"http://api.hospital.cl", "http://localhost:*"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"*"},
		ExposeHeaders: []string{"*"},
	}))

	return router
}
