package config

import (
    "os"
    "fmt"
    "github.com/joho/godotenv"
)

type Settings struct {
    ProjectName      string
    PostgresUser     string
    PostgresPassword string
    PostgresServer   string
    PostgresPort     string
    PostgresDB       string
    DepartmentID     uint
}

func (s *Settings) DatabaseURL() string {
    return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
        s.PostgresServer, s.PostgresUser, s.PostgresPassword, s.PostgresDB, s.PostgresPort)
}

func LoadConfig() (*Settings, error) {
    _ = godotenv.Load(".env")

    return &Settings{
        ProjectName:      getEnv("PROJECT_NAME", "S.G.H - Inventory Service"),
        PostgresUser:     os.Getenv("POSTGRES_USER"),
        PostgresPassword: os.Getenv("POSTGRES_PASSWORD"),
        PostgresServer:   os.Getenv("POSTGRES_SERVER"),
        PostgresPort:     os.Getenv("POSTGRES_PORT"),
        PostgresDB:       os.Getenv("POSTGRES_DB"),
        DepartmentID:     parseUint(os.Getenv("DEPARTMENT_ID"), 1),
    }, nil
}

func parseUint(s string, fallback uint) uint {
    if s == "" {
        return fallback
    }
    var val uint
    if _, err := fmt.Sscanf(s, "%d", &val); err != nil {
        return fallback
    }
    return val
}

func getEnv(key, fallback string) string {
    if value, ok := os.LookupEnv(key); ok {
        return value
    }
    return fallback
}
