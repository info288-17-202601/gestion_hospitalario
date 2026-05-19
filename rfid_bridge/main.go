package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"go.bug.st/serial"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	SerialPort     = "/dev/ttyACM0"
	BaudRate       = 9600
	APIURL         = "http://localhost:7050/api/v1/auth/login/rfid"
	ConnectTimeout = 60 * time.Second
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
		Timeout: 15 * time.Second,
	}

	resp, err := client.Post(APIURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	responseBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("login RFID falló. Status: %d, Body: %s", resp.StatusCode, string(responseBody))
	}

	fmt.Println("\n--- Respuesta del backend ---")
	fmt.Println("Status:", resp.StatusCode)
	fmt.Println("RFID_LOGIN_RESPONSE:" + string(responseBody))

	return nil
}

func main() {
	modeArg := "serve"
	if len(os.Args) > 1 {
		modeArg = os.Args[1]
	}

	if modeArg == "--mock" || modeArg == "mock" {
		fmt.Println("Modo mock RFID iniciado")

		payload := RFIDLoginRequest{
			UID: "234BA711",
			PIN: "1234",
		}

		err := sendToBackend(payload)
		if err != nil {
			fmt.Println("RFID_LOGIN_ERROR:", err)
			return
		}

		fmt.Println("RFID_LOGIN_SUCCESS")
		return
	}

	if modeArg != "serve" {
		fmt.Println("Modo desconocido:", modeArg)
		return
	}

	fmt.Println("Bridge RFID iniciado")
	fmt.Println("Puerto serial:", SerialPort)
	fmt.Println("Backend:", APIURL)

	deadline := time.Now().Add(ConnectTimeout)
	var port io.ReadCloser
	for {
		serialMode := &serial.Mode{
			BaudRate: BaudRate,
		}

		p, err := serial.Open(SerialPort, serialMode)
		if err != nil {
			if time.Now().After(deadline) {
				fmt.Println("No esta conectado el lector, tiempo de espera agotado")
				fmt.Println("RFID_CONNECTION_TIMEOUT")
				os.Exit(1)
			}

			fmt.Println("No esta conectado el lector, esperando conexion...")
			time.Sleep(2 * time.Second)
			continue
		}

		port = p
		break
	}
	defer port.Close()

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
			fmt.Println("RFID_LOGIN_ERROR:", err)
			continue
		}

		fmt.Println("RFID_LOGIN_SUCCESS")
		return
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error leyendo serial:", err)
	}
}
