package api

import (
	"authentication_service/internal/api/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

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
