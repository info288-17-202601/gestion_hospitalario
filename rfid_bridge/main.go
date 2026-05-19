package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"go.bug.st/serial"
)

const (
	SerialPort = "/dev/ttyACM0" 
	BaudRate   = 9600
	APIURL     = "http://localhost:7050/api/v1/auth/login/rfid"
)

type RFIDLoginRequest struct {
	UID string `json:"uid"`
	PIN string `json:"pin"`
}

func sendToBackend(payload RFIDLoginRequest) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Post(APIURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	responseBody, _ := io.ReadAll(resp.Body)

	fmt.Println("\n--- Respuesta del backend ---")
	fmt.Println("Status:", resp.StatusCode)
	fmt.Println("Body:", string(responseBody))

	return nil
}

func main() {
	mode := &serial.Mode{
		BaudRate: BaudRate,
	}

	port, err := serial.Open(SerialPort, mode)
	if err != nil {
		fmt.Println("Error abriendo puerto serial:", err)
		return
	}
	defer port.Close()

	fmt.Println("Bridge RFID iniciado")
	fmt.Println("Puerto serial:", SerialPort)
	fmt.Println("Backend:", APIURL)
	fmt.Println("Esperando datos del Arduino...")

	scanner := bufio.NewScanner(port)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if line == "" {
			continue
		}

		fmt.Println("Serial recibido:", line)

		if !strings.HasPrefix(line, "{") {
			continue
		}

		var payload RFIDLoginRequest

		err := json.Unmarshal([]byte(line), &payload)
		if err != nil {
			fmt.Println("JSON inválido:", err)
			continue
		}

		if payload.UID == "" || payload.PIN == "" {
			fmt.Println("JSON incompleto:", payload)
			continue
		}

		fmt.Println("UID:", payload.UID)
		fmt.Println("PIN:", payload.PIN)

		err = sendToBackend(payload)
		if err != nil {
			fmt.Println("Error enviando al backend:", err)
		}
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error leyendo serial:", err)
	}
}