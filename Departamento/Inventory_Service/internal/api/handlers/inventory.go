package handlers

import (
	"net/http"

	"inventory_service/internal/db"
	"inventory_service/internal/schemas"
	"inventory_service/internal/services"

	"github.com/gin-gonic/gin"
)

// @Summary Modify department stock
// @Description Modifies the stock of a supply for a specific department (increase or decrease)
// @Tags inventory
// @Accept json
// @Produce json
// @Param request body schemas.StockModificationRequest true "Stock modification data"
// @Success 200 {object} schemas.OperationResponse "Successful operation"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 404 {object} map[string]string "Department or supply not found"
// @Failure 422 {object} map[string]string "Validation error"
// @Router /inventory/departments/stock [post]
func ModifyDepartmentStock(c *gin.Context) {
	var req schemas.StockModificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"detail": err.Error()})
		return
	}

	service := services.NewInventoryService(db.GetDB())
	movement, err := service.ModifyStock(req)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "Department not found" || err.Error() == "Supply not found" {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schemas.OperationResponse{
		Message:    "Stock modified successfully",
		Status:     "success",
		MovementID: &movement.ID,
	})
}

// @Summary Register an inventory movement
// @Description Registers a general movement in the inventory
// @Tags inventory
// @Accept json
// @Produce json
// @Param request body schemas.MovementRequest true "Movement data"
// @Success 200 {object} schemas.OperationResponse "Movement successfully registered"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 422 {object} map[string]string "Validation error"
// @Router /inventory/movement [post]
func RegisterMovement(c *gin.Context) {
	var req schemas.MovementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"detail": err.Error()})
		return
	}

	service := services.NewInventoryService(db.GetDB())
	movement, err := service.RegisterMovement(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, schemas.OperationResponse{
		Message:    "Movement registered successfully",
		Status:     "success",
		MovementID: &movement.ID,
	})
}
