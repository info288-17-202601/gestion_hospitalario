package api

import (
	"time"

	"inventory_service/internal/api/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://localhost:8010",
			"http://127.0.0.1:8010",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	apiV1 := router.Group("/api/v1")
	{
		inventory := apiV1.Group("/inventory")
		{
			// Categorías
			inventory.GET("/categories", handlers.GetCategories)

			// Insumos
			inventory.GET("/supplies", handlers.GetSupplies)
			inventory.POST("/supplies", handlers.CreateSupply)
			inventory.PUT("/supplies/:id", handlers.UpdateSupply)

			// Stock por departamento
			inventory.GET("/departments/stock", handlers.GetDepartmentStock)
			inventory.POST("/departments/stock", handlers.ModifyDepartmentStock)

			// Movimientos
			inventory.GET("/movements", handlers.GetMovements)
			inventory.POST("/movements", handlers.RegisterMovement)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "Inventory Service",
		})
	})

	return router
}