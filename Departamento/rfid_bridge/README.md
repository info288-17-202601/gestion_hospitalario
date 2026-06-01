# RFID Bridge (`rfid_bridge`)

This component is a communication bridge written in **Go** that acts as an intermediary between a physical RFID card/tag reader (e.g., based on Arduino or another microcontroller) connected via serial port and the department's authentication service.

---

## How It Works

The program operates as follows:
1. **Serial Connection**: Attempts to establish a serial connection with the serial port `/dev/ttyACM0` (or configured port) at a speed of `9600` baud.
2. **Device Waiting**: If the RFID reader is not connected or the port is not available, the bridge will actively wait for a maximum duration of **60 seconds** (`ConnectTimeout`). If it fails to connect during this period, the program exits with a timeout error.
3. **Data Listening**: Once connected, it continuously reads lines sent by the RFID reader through the serial interface.
4. **Formatting and Forwarding**: Expects to receive a structured JSON object containing the card UID and PIN. Once validated, it makes an HTTP POST request to the backend at `http://localhost:7050/api/v1/auth/login/rfid` (or configured API URL).

---

## Prerequisites

1. **Go (Golang)**: Requires **Go 1.22.2** or higher installed on the system.
2. **Physical RFID Device**: A physical RFID reader device is expected to be **connected** to the serial port.
   - *Default Port:* `/dev/ttyACM0`
   - *Baud Rate:* `9600`
3. **Serial Port Permissions (Linux)**:
   In order for the bridge to open and read from `/dev/ttyACM0` without requiring `sudo` privileges, the current user must belong to the `dialout` group (or `uucp` in some distributions).
   You can add yourself to this group by running:
   ```bash
   sudo usermod -a -G dialout $USER
   ```
   *Note: You need to log out and log back in (or restart your terminal/system) for the group changes to take effect.*

---

## Compilation Instructions

To compile the executable binary of `rfid_bridge`, follow these steps:

1. Open a terminal and navigate to the bridge directory:
   ```bash
   cd Departamento/rfid_bridge
   ```

2. Tidy the Go dependencies (optional but recommended):
   ```bash
   go mod tidy
   ```

3. Compile the project:
   ```bash
   go build -o rfid_bridge main.go
   ```
   *This will generate an executable binary file named `rfid_bridge` in the current directory.*

---

## Execution Instructions

The bridge has two main execution modes:

### 1. Normal Mode (`serve`)
This mode requires the physical RFID reader to be connected to the specified serial port.

* **Run using the compiled binary:**
  ```bash
  ./rfid_bridge
  ```
  *(or equivalently `./rfid_bridge serve`)*

* **Run directly with Go (without compiling):**
  ```bash
  go run main.go
  ```

### 2. Mock Mode (`mock`)
If you don't have the physical reader connected or wish to perform quick tests of the authentication API, you can run the program in mock simulation mode. This mode sends a pre-defined simulated login (`UID: 234BA711`, `PIN: 1234`) directly to the backend without looking for serial ports.

* **Run using the compiled binary:**
  ```bash
  ./rfid_bridge mock
  ```
  *(or `./rfid_bridge --mock`)*

* **Run directly with Go (without compiling):**
  ```bash
  go run main.go mock
  ```

---

## Serial Communication Protocol

The RFID reader connected via USB/serial must send the information structured as a single plain text line formatted in JSON with the following exact schema:

```json
{"uid": "234BA711", "pin": "1234"}
```

Each message sent by the serial device must end with a newline character (`\n` or `\r\n`) so that the Go scanner processes it correctly.

---

## Configuration via Environment Variables (`.env`)

The bridge can be dynamically configured using environment variables or a `.env` file. Upon startup, the application will attempt to find and load a `.env` file in the local execution directory, and optionally also from the parent directory (`../.env`) to align with the unified configuration at the **Department** level.

### Available Variables

| Variable | Description | Default Value | Example |
| :--- | :--- | :--- | :--- |
| `RFID_PORT` | Path to the serial port where the RFID reader is connected. | `/dev/ttyACM0` | `/dev/ttyUSB0` |
| `RFID_BAUD` | Communication baud rate. | `9600` | `115200` |
| `RFID_API_URL` | Endpoint of the departmental authentication service to validate RFID logins. | `http://localhost:7050/api/v1/auth/login/rfid` | `http://auth-service:7050/api/v1/auth/login/rfid` |
| `RFID_CONNECT_TIMEOUT` | Maximum duration allowed to connect to the physical reader (accepts Go duration format like `60s` or an integer in seconds like `60`). | `60s` | `30s` or `30` |

### `.env` File Template

You can create a local `.env` file in `Departamento/rfid_bridge/.env` or use the unified configuration file at the department level (`Departamento/.env`):

```env
# RFID Bridge Settings
RFID_PORT=/dev/ttyACM0
RFID_BAUD=9600
RFID_API_URL=http://localhost:7050/api/v1/auth/login/rfid
RFID_CONNECT_TIMEOUT=60s
```

*Note: Environment variables defined in the operating system shell take priority over values defined in `.env` files, which in turn take priority over defaults.*
