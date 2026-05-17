package api

import (
    "github.com/gin-gonic/gin"
    "inventory_service/internal/api/handlers"
)

func SetupRouter() *gin.Engine {
    router := gin.Default()

    apiV1 := router.Group("/api/v1")
    {
        inventory := apiV1.Group("/inventory")
        {
            inventory.POST("/departments/stock", handlers.ModifyDepartmentStock)
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
