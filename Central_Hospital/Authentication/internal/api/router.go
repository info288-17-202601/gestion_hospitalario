package api

import (
	"authentication_service/internal/api/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	// CORS policy
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8010", "http://localhost:8020", "http://localhost", "http://api.hospital.cl"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	apiV1 := router.Group("/api/v1")
	{
		auth := apiV1.Group("/auth")
		{
			auth.POST("/login/classic", handlers.LoginClassic)
			auth.POST("/login/rfid", handlers.LoginRFID)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "Authentication Service",
		})
	})

	return router
}
