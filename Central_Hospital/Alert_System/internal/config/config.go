package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Settings struct {
	ProjectName      string
	PostgresUser     string
	PostgresPassword string
	PostgresServer   string
	PostgresPort     string
	PostgresDB       string
	RabbitMQURL      string
	RabbitMQQueue    string
	Port             string
}

func (s *Settings) DatabaseURL() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		s.PostgresServer, s.PostgresUser, s.PostgresPassword, s.PostgresDB, s.PostgresPort)
}

func LoadConfig() (*Settings, error) {
	// Attempt to load .env file if it exists, ignore failure if environment variables are already set (e.g., in Docker)
	_ = godotenv.Load(".env")

	return &Settings{
		ProjectName:      getEnv("PROJECT_NAME", "Central Hospital - Alert Service"),
		PostgresUser:     getEnv("POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "postgres"),
		PostgresServer:   getEnv("POSTGRES_SERVER", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "6000"),
		PostgresDB:       getEnv("POSTGRES_DB", "gestion_hospitalario"),
		RabbitMQURL:      getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		RabbitMQQueue:    getEnv("RABBITMQ_QUEUE", "alert_queue"),
		Port:             getEnv("PORT", "7030"),
	}, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
