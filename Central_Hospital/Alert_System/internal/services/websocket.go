package services

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn *websocket.Conn
	Send chan []byte
}

type WebSocketService struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mutex      sync.RWMutex
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run executes the main WebSocket service loop handling client lifecycle and broadcasts.
func (s *WebSocketService) Run() {
	for {
		select {
		case client := <-s.register:
			s.mutex.Lock()
			s.clients[client] = true
			s.mutex.Unlock()
			log.Println("[WebSocket] Client registered successfully")

		case client := <-s.unregister:
			s.mutex.Lock()
			if _, ok := s.clients[client]; ok {
				delete(s.clients, client)
				close(client.Send)
			}
			s.mutex.Unlock()
			log.Println("[WebSocket] Client unregistered successfully")

		case message := <-s.broadcast:
			s.mutex.Lock()
			for client := range s.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(s.clients, client)
				}
			}
			s.mutex.Unlock()
		}
	}
}

func (s *WebSocketService) Register(client *Client) {
	s.register <- client
}

func (s *WebSocketService) Unregister(client *Client) {
	s.unregister <- client
}

func (s *WebSocketService) Broadcast(message []byte) {
	s.broadcast <- message
}

// WritePump pushes outbound messages from the Client's send channel to the peer connection.
func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()
	for {
		message, ok := <-c.Send
		if !ok {
			// The Hub closed the channel.
			_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		err := c.Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("[WebSocket] Error sending message: %v", err)
			return
		}
	}
}
