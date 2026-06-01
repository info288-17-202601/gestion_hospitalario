package api

import (
	"fmt"
	"net/http"
	"strconv"

	"reporting_service/internal/config"
	"reporting_service/internal/models"
	"reporting_service/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var appConfig *config.Config
var _ models.CriticalStockReport

func SetConfig(cfg *config.Config) {
	appConfig = cfg
}

// SetupRouter configura las rutas de la API
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS config
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"*"}
	config.ExposeHeaders = []string{"*"}
	r.Use(cors.New(config))

	// Swagger documentation route
	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/reports")
	{
		api.GET("/critical-stock", getCriticalStock)
		api.GET("/monthly-consumption", getMonthlyConsumption)
		api.GET("/traceability", getTraceability)
		api.GET("/active-alerts", getActiveAlerts)
		api.GET("/inventory", getDepartmentInventory)
		api.GET("/departments", getDepartments)
		api.GET("/supplies", getSupplies)
		api.GET("/categories", getCategories)
	}

	return r
}

func parseDepartmentID(c *gin.Context) (int, error) {
	deptIDStr := c.Query("department_id")
	if deptIDStr == "" {
		return 0, fmt.Errorf("Falta el parametro department_id")
	}
	deptID, err := strconv.Atoi(deptIDStr)
	if err != nil {
		return 0, fmt.Errorf("El parametro department_id debe ser un entero valido")
	}
	return deptID, nil
}

// @Summary Get critical stock report
// @Description Returns supplies with quantity <= minimum stock for the specified department
// @Tags reports
// @Produce json
// @Param department_id query int true "Department ID"
// @Success 200 {array} models.CriticalStockReport
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /reports/critical-stock [get]
func getCriticalStock(c *gin.Context) {
	deptID, err := parseDepartmentID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reports, err := services.GetCriticalStockReport(deptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener stock critico", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// @Summary Get monthly consumption report
// @Description Returns the total quantity of consumed supplies in the last 30 days for the specified department
// @Tags reports
// @Produce json
// @Param department_id query int true "Department ID"
// @Success 200 {array} models.MonthlyConsumptionReport
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /reports/monthly-consumption [get]
func getMonthlyConsumption(c *gin.Context) {
	deptID, err := parseDepartmentID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reports, err := services.GetMonthlyConsumptionReport(deptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener consumo mensual", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// @Summary Get traceability report for a supply
// @Description Returns the movement history of a specific supply in the specified department
// @Tags reports
// @Produce json
// @Param department_id query int true "Department ID"
// @Param supply_code query string true "Supply Internal Code"
// @Success 200 {array} models.TraceabilityReport
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /reports/traceability [get]
func getTraceability(c *gin.Context) {
	deptID, err := parseDepartmentID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	supplyCode := c.Query("supply_code")
	if supplyCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Falta el parametro supply_code"})
		return
	}

	reports, err := services.GetTraceabilityReport(deptID, supplyCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener trazabilidad", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// @Summary Get active alerts report
// @Description Returns all active alerts for the specified department
// @Tags reports
// @Produce json
// @Param department_id query int true "Department ID"
// @Success 200 {array} models.ActiveAlertReport
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /reports/active-alerts [get]
func getActiveAlerts(c *gin.Context) {
	deptID, err := parseDepartmentID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reports, err := services.GetActiveAlertsReport(deptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener alertas", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// @Summary Get full department inventory report
// @Description Returns the full inventory of all departments
// @Tags reports
// @Produce json
// @Success 200 {array} models.DepartmentInventoryReport
// @Failure 500 {object} map[string]string
// @Router /reports/inventory [get]
func getDepartmentInventory(c *gin.Context) {
	reports, err := services.GetDepartmentInventoryReport()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener inventario", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

// @Summary Get all departments
// @Description Returns all departments
// @Tags reports
// @Produce json
// @Success 200 {array} models.Department
// @Failure 500 {object} map[string]string
// @Router /reports/departments [get]
func getDepartments(c *gin.Context) {
	depts, err := services.GetDepartments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener departamentos", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, depts)
}

// @Summary Get all supplies
// @Description Returns all supplies
// @Tags reports
// @Produce json
// @Success 200 {array} models.Supply
// @Failure 500 {object} map[string]string
// @Router /reports/supplies [get]
func getSupplies(c *gin.Context) {
	sups, err := services.GetSupplies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener insumos", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sups)
}

// @Summary Get all categories
// @Description Returns all supply categories
// @Tags reports
// @Produce json
// @Success 200 {array} models.Category
// @Failure 500 {object} map[string]string
// @Router /reports/categories [get]
func getCategories(c *gin.Context) {
	cats, err := services.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener categorias", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cats)
}
