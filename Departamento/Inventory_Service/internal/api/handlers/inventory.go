package handlers

import (
	"net/http"

	"inventory_service/internal/db"
	"inventory_service/internal/schemas"
	"inventory_service/internal/services"

	"github.com/gin-gonic/gin"
)

// ===============================
// GET CATEGORIES
// ===============================

// @Summary Get supply categories
// @Description Returns all supply categories
// @Tags inventory
// @Produce json
// @Success 200 {array} models.SupplyCategory
// @Failure 500 {object} map[string]string
// @Router /inventory/categories [get]
func GetCategories(c *gin.Context) {
	service := services.NewInventoryService(db.GetDB())

	categories, err := service.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// ===============================
// GET SUPPLIES
// ===============================

// @Summary Get supplies
// @Description Returns all supplies
// @Tags inventory
// @Produce json
// @Success 200 {array} models.Supply
// @Failure 500 {object} map[string]string
// @Router /inventory/supplies [get]
func GetSupplies(c *gin.Context) {
	service := services.NewInventoryService(db.GetDB())

	supplies, err := service.GetSupplies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, supplies)
}

// ===============================
// GET DEPARTMENT STOCK
// ===============================

// @Summary Get department stock
// @Description Returns the stock of the configured department
// @Tags inventory
// @Produce json
// @Success 200 {array} models.DepartmentInventory
// @Failure 500 {object} map[string]string
// @Router /inventory/departments/stock [get]
func GetDepartmentStock(c *gin.Context) {
	service := services.NewInventoryService(db.GetDB())

	stock, err := service.GetDepartmentStock()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stock)
}

// ===============================
// GET MOVEMENTS
// ===============================

// @Summary Get inventory movements
// @Description Returns all inventory movements for the configured department
// @Tags inventory
// @Produce json
// @Success 200 {array} models.InventoryMovement
// @Failure 500 {object} map[string]string
// @Router /inventory/movements [get]
func GetMovements(c *gin.Context) {
	service := services.NewInventoryService(db.GetDB())

	movements, err := service.GetMovements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, movements)
}

// ===============================
// MODIFY DEPARTMENT STOCK
// ===============================

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

// ===============================
// REGISTER MOVEMENT
// ===============================

// @Summary Register an inventory movement
// @Description Registers a general movement in the inventory
// @Tags inventory
// @Accept json
// @Produce json
// @Param request body schemas.MovementRequest true "Movement data"
// @Success 200 {object} schemas.OperationResponse "Movement successfully registered"
// @Failure 400 {object} map[string]string "Bad request"
// @Failure 422 {object} map[string]string "Validation error"
// @Router /api/v1/inventory/movements [post]
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