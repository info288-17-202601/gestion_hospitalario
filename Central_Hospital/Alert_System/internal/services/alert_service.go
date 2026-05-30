package services

import (
	"encoding/json"
	"errors"
	"log"
	"time"

	"alert_system/internal/config"
	"alert_system/internal/models"
	"alert_system/internal/schemas"

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm"
)

type AlertService struct {
	db  *gorm.DB
	cfg *config.Settings
	ws  *WebSocketService
}

func NewAlertService(db *gorm.DB, cfg *config.Settings, ws *WebSocketService) *AlertService {
	return &AlertService{
		db:  db,
		cfg: cfg,
		ws:  ws,
	}
}

// GetAlerts fetches all alerts ordered by creation date descending.
func (s *AlertService) GetAlerts() ([]models.Alert, error) {
	var alerts []models.Alert
	err := s.db.Order("created_at desc").Find(&alerts).Error
	return alerts, err
}

// UpdateAlertStatus updates the status of a specific alert in the database.
func (s *AlertService) UpdateAlertStatus(id uint, status string) (models.Alert, error) {
	var alert models.Alert

	// Validate status
	if status != "PENDING" && status != "REVIEWED" && status != "RESOLVED" {
		return alert, errors.New("invalid status: must be PENDING, REVIEWED, or RESOLVED")
	}

	// Fetch alert
	if err := s.db.First(&alert, id).Error; err != nil {
		return alert, err
	}

	// Update status
	alert.Status = status
	if err := s.db.Save(&alert).Error; err != nil {
		return alert, err
	}

	return alert, nil
}

// StartConsuming connects to RabbitMQ and consumes messages in a resilient auto-reconnecting loop.
func (s *AlertService) StartConsuming(queueName string) {
	for {
		log.Println("[RabbitMQ] Attempting to connect to RabbitMQ...")
		conn, err := amqp.Dial(s.cfg.RabbitMQURL)
		if err != nil {
			log.Printf("[RabbitMQ] Connection failed: %v. Retrying in 5 seconds...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		ch, err := conn.Channel()
		if err != nil {
			log.Printf("[RabbitMQ] Failed to open channel: %v", err)
			_ = conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		q, err := ch.QueueDeclare(
			queueName, // queue name
			true,      // durable
			false,     // auto-delete
			false,     // exclusive
			false,     // no-wait
			nil,       // arguments
		)
		if err != nil {
			log.Printf("[RabbitMQ] Failed to declare queue: %v", err)
			_ = ch.Close()
			_ = conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		msgs, err := ch.Consume(
			q.Name,         // queue name
			"alert_worker", // consumer tag
			false,          // auto-ack (false for manual ack)
			false,          // exclusive
			false,          // no-local
			false,          // no-wait
			nil,            // arguments
		)
		if err != nil {
			log.Printf("[RabbitMQ] Failed to register consumer: %v", err)
			_ = ch.Close()
			_ = conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		log.Printf("[RabbitMQ] Consumer registered successfully. Listening to queue: %s", queueName)

		// Read messages from the delivery channel
		for d := range msgs {
			s.processMessage(d)
		}

		log.Println("[RabbitMQ] Message channel closed. Cleaning up and reconnecting...")
		_ = ch.Close()
		_ = conn.Close()
		time.Sleep(2 * time.Second)
	}
}

// processMessage parses RabbitMQ payload, saves to database, and broadcasts to active WebSockets.
func (s *AlertService) processMessage(d amqp.Delivery) {
	log.Printf("[RabbitMQ] Message received: %s", d.Body)

	var msg schemas.AlertMessage
	if err := json.Unmarshal(d.Body, &msg); err != nil {
		log.Printf("[RabbitMQ] Failed to parse JSON body: %v", err)
		// Negative-Acknowledge. Do not re-queue invalid JSON structure.
		_ = d.Nack(false, false)
		return
	}

	var alert models.Alert
	var err error
	isUpdate := false

	// Check if a PENDING low stock alert already exists for the same supply and department
	if msg.Type == "low_stock" && msg.SupplyID != nil && msg.DepartmentID != nil {
		var existingAlert models.Alert
		err = s.db.Where("type = ? AND status = ? AND supply_id = ? AND department_id = ?",
			"low_stock", "PENDING", *msg.SupplyID, *msg.DepartmentID).First(&existingAlert).Error

		if err == nil {
			// Update the existing alert message, timestamp, and flag it as an update
			existingAlert.Message = msg.Message
			existingAlert.CreatedAt = time.Now()
			alert = existingAlert
			isUpdate = true
		}
	}

	if isUpdate {
		// Save the updated existing alert GORM-persisted
		if err = s.db.Save(&alert).Error; err != nil {
			log.Printf("[Database] Failed to update existing alert: %v. Re-queuing message...", err)
			_ = d.Nack(false, true)
			return
		}
		log.Printf("[Database] Existing pending alert updated successfully with ID: %d", alert.ID)
	} else {
		// Create a brand new alert record
		alert = models.Alert{
			Type:         msg.Type,
			Message:      msg.Message,
			Status:       "PENDING",
			SupplyID:     msg.SupplyID,
			DepartmentID: msg.DepartmentID,
			CreatedAt:    time.Now(),
		}
		if err = s.db.Create(&alert).Error; err != nil {
			log.Printf("[Database] Failed to save new alert to PostgreSQL: %v. Re-queuing message...", err)
			// Re-queue message for future retry
			_ = d.Nack(false, true)
			return
		}
		log.Printf("[Database] Brand new alert persisted successfully with ID: %d", alert.ID)
	}

	// Broadcast alert via WebSocket to all web clients
	payload, err := json.Marshal(alert)
	if err != nil {
		log.Printf("[WebSocket] Failed to marshal alert response: %v", err)
	} else {
		s.ws.Broadcast(payload)
		log.Println("[WebSocket] Broadcasted alert successfully to active connections")
	}

	// Positive-Acknowledge message processing completion
	_ = d.Ack(false)
}
