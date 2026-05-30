package handlers

import (
	"log"
	"net/http"
	"strconv"

	_ "alert_system/internal/models"
	"alert_system/internal/schemas"
	"alert_system/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for Nginx reverse proxy routing
		return true
	},
}

type AlertHandler struct {
	alertService *services.AlertService
	wsService    *services.WebSocketService
}

func NewAlertHandler(alertService *services.AlertService, wsService *services.WebSocketService) *AlertHandler {
	return &AlertHandler{
		alertService: alertService,
		wsService:    wsService,
	}
}

// ServeWS handles WebSocket upgrading and binds connection lifecycle events to the Hub.
func (h *AlertHandler) ServeWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade failure: %v", err)
		return
	}

	client := &services.Client{
		Conn: conn,
		Send: make(chan []byte, 256),
	}

	h.wsService.Register(client)

	// Clean up registration on connection close
	defer func() {
		h.wsService.Unregister(client)
	}()

	// Execute write pump synchronously to keep the request handler goroutine alive
	client.WritePump()
}

// GetAlerts godoc
// @Summary      Get all historical alerts
// @Description  Retrieve a list of all historical system alerts, ordered by creation date descending.
// @Tags         alerts
// @Produce      json
// @Success      200  {array}   models.Alert
// @Failure      500  {object}  map[string]string "error"
// @Router       /alert [get]
// GetAlerts returns a JSON list of all historical system alerts (newest first).
func (h *AlertHandler) GetAlerts(c *gin.Context) {
	alerts, err := h.alertService.GetAlerts()
	if err != nil {
		log.Printf("[API] Failed to fetch alerts: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve alerts"})
		return
	}

	c.JSON(http.StatusOK, alerts)
}

// UpdateAlertStatus godoc
// @Summary      Update alert status
// @Description  Modify the status field of a specific alert by ID (value must be one of: PENDING, REVIEWED, RESOLVED).
// @Tags         alerts
// @Accept       json
// @Produce      json
// @Param        id      path      int                               true  "Alert ID"
// @Param        status  body      schemas.UpdateAlertStatusRequest  true  "New status payload"
// @Success      200     {object}  models.Alert
// @Failure      400     {object}  map[string]string "error"
// @Failure      500     {object}  map[string]string "error"
// @Router       /alert/{id}/status [put]
// UpdateAlertStatus modifies status field of a specific alert in PostgreSQL database.
func (h *AlertHandler) UpdateAlertStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID format"})
		return
	}

	var req schemas.UpdateAlertStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedAlert, err := h.alertService.UpdateAlertStatus(uint(id), req.Status)
	if err != nil {
		log.Printf("[API] Failed to update alert %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedAlert)
}
