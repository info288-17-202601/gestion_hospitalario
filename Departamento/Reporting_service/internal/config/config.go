package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	PostgresUser     string
	PostgresPassword string
	PostgresServer   string
	PostgresPort     string
	PostgresDB       string
	DepartmentID     int
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	deptID, err := strconv.Atoi(os.Getenv("DEPARTMENT_ID"))
	if err != nil {
		log.Fatalf("Invalid or missing DEPARTMENT_ID: %v", err)
	}

	return &Config{
		PostgresUser:     os.Getenv("POSTGRES_USER"),
		PostgresPassword: os.Getenv("POSTGRES_PASSWORD"),
		PostgresServer:   os.Getenv("POSTGRES_SERVER"),
		PostgresPort:     os.Getenv("POSTGRES_PORT"),
		PostgresDB:       os.Getenv("POSTGRES_DB"),
		DepartmentID:     deptID,
	}
}
