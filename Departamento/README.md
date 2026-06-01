# Department Configuration & Documentation

This directory contains the services and configurations deployed at the hospital department nodes:
- **Inventory Service (`Inventory_Service`)**: A Go backend service that manages local stock levels, registers inventory movements, validates minimum stock limits, and publishes alerts to RabbitMQ when stocks fall below the safety threshold.
- **RFID Bridge (`rfid_bridge`)**: A Go communication bridge that reads RFID credentials (UID + PIN) from a physical serial port reader and performs authentication requests against the department backend.

To simplify deployment and integration with the central hospital infrastructure, **a single unified `.env` file is used at the root of `Departamento/`** (`Departamento/.env`) which is loaded by the services in `docker-compose-departamento.yml`.

---

## Environment Variables (`.env`)

Below is the explanation of all environment variables defined in the department `.env` file (`Departamento/.env`).

### 1. Database Configuration (PostgreSQL Connection)
Although the PostgreSQL database resides centrally, the department backend needs full connection parameters to read/write department-specific stock:
* **`POSTGRES_DB`**: Name of the target database (e.g., `gestion_hospitalario`).
* **`POSTGRES_USER`**: Database username (e.g., `postgres`).
* **`POSTGRES_PASSWORD`**: Database password.
* **`POSTGRES_SERVER`**: The server hostname or IP address of the database. During Docker-based execution, this should point to `postgres`. If running directly on the host, use `localhost`.
* **`POSTGRES_PORT`**: Port number of the database service (e.g., `6000`).

### 2. Department Identity
* **`DEPARTMENT_ID`**: The unique integer identifier representing this specific hospital department node (e.g., `1`). This restricts inventory actions to the assigned department.

### 3. Messaging Settings (RabbitMQ)
Used by the Inventory Service to publish alerts to the queue whenever stock drops below the required minimum level:
* **`RABBITMQ_URL`**: Full AMQP connection URI pointing to the central RabbitMQ broker (e.g., `amqp://guest:guest@rabbitmq:7040/` or `amqp://guest:guest@localhost:7040/`).
* **`RABBITMQ_QUEUE`**: The destination queue name where low-stock and movement alerts will be published (e.g., `alert_queue`).

### 4. RFID Bridge Settings
Used to configure the connection to the physical RFID reader device and the target authentication service:
* **`RFID_PORT`**: File path to the serial port device where the RFID reader is connected (e.g., `/dev/ttyACM0` or `/dev/ttyUSB0`).
* **`RFID_BAUD`**: Baud rate for the serial connection (e.g., `9600`).
* **`RFID_API_URL`**: Endpoint address where RFID authentication requests are processed (e.g., `http://localhost:7050/api/v1/auth/login/rfid`).
* **`RFID_CONNECT_TIMEOUT`**: Maximum duration allowed to search for and connect to the physical serial port (e.g., `60s` or a number of seconds like `60`).

---

## Unified `.env` Template

Create a file named `.env` in this directory (`Departamento/.env`) with the following variables:

```env
# Database Settings
POSTGRES_DB=gestion_hospitalario
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=postgres
POSTGRES_PORT=6000

# Department node identifier
DEPARTMENT_ID=1

# RabbitMQ Settings
RABBITMQ_URL=amqp://guest:guest@rabbitmq:7040/
RABBITMQ_QUEUE=alert_queue

# RFID Bridge Settings
RFID_PORT=/dev/ttyACM0
RFID_BAUD=9600
RFID_API_URL=http://localhost:7050/api/v1/auth/login/rfid
RFID_CONNECT_TIMEOUT=60s
```
