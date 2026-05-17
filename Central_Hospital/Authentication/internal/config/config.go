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
	JWTSecret        string
}

func (s *Settings) DatabaseURL() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		s.PostgresServer, s.PostgresUser, s.PostgresPassword, s.PostgresDB, s.PostgresPort)
}

func LoadConfig() (*Settings, error) {
	_ = godotenv.Load(".env")

	return &Settings{
		ProjectName:      getEnv("PROJECT_NAME", "Central Hospital - Auth Service"),
		PostgresUser:     getEnv("POSTGRES_USER", "postgres"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "postgres"),
		PostgresServer:   getEnv("POSTGRES_SERVER", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresDB:       getEnv("POSTGRES_DB", "gestion_hospitalario"),
		JWTSecret:        getEnv("JWT_SECRET", "super_secret_key"),
	}, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
