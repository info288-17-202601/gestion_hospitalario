# Central Hospital Configuration & Documentation

This directory contains the core services and database settings for the central administration of the Hospital Management System (S.G.H):
- **Database (`Data_Base`)**: PostgreSQL database container.
- **Authentication Service (`Authentication`)**: Handles system-wide user credentials and JWT verification.
- **Alert System (`Alert_System`)**: RabbitMQ consumer and WebSocket hub for sending low-stock and movement alerts.
- **Reporting Service (`Reporting_service`)**: Compiles operational reports regarding stock, active alerts, and traceability.

To streamline development and container deployment, **a single unified `.env` file is used at the root of `Central_Hospital/`** (`Central_Hospital/.env`) which is loaded by all services in `docker-compose-central-hospital.yml`.

---

## Unified Environment Variables (`.env`)

Below is the explanation of all environment variables defined in the central `.env` file (`Central_Hospital/.env`).

### 1. Database Configuration (PostgreSQL)
These variables configure the PostgreSQL connection and are shared by all backend services and the DB container:
* **`POSTGRES_DB`**: Name of the target database (e.g., `gestion_hospitalario`).
* **`POSTGRES_USER`**: PostgreSQL username (e.g., `postgres`).
* **`POSTGRES_PASSWORD`**: Password associated with the database user.
* **`POSTGRES_SERVER`**: The hostname or IP address of the database. Inside the Docker Compose network, this points to `postgres`. If running a service directly on the host, use `localhost`.
* **`POSTGRES_PORT`**: Port number where PostgreSQL is running (e.g., `6000`).

### 2. Authentication Settings
* **`JWT_SECRET`**: A cryptographically secure secret string used by the Authentication Service to sign and verify JSON Web Tokens (e.g., `super_secret_hospital_key`).

### 3. Messaging Settings (RabbitMQ)
Used by the Alert System to connect to the RabbitMQ message broker:
* **`RABBITMQ_URL`**: Full AMQP connection URI (e.g., `amqp://guest:guest@rabbitmq:5672/` or `amqp://guest:guest@localhost:5672/`).
* **`RABBITMQ_QUEUE`**: The queue name where low-stock notifications are consumed (e.g., `alert_queue`).

### 4. Alert & Reporting Service Settings
* **`PROJECT_NAME`**: Name identifier for the Alert service instance (e.g., `"Central Hospital - Alert Service"`).
* **`PORT`**: Operational port for the service (e.g., `7030`).

---

## Unified `.env` Template

Create a file named `.env` in this directory (`Central_Hospital/.env`) with the following variables:

```env
# Database Settings
POSTGRES_DB=gestion_hospitalario
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=postgres
POSTGRES_PORT=6000

# Authentication Settings
JWT_SECRET=super_secret_hospital_key

# Alert System Settings
PROJECT_NAME="Central Hospital - Alert Service"
PORT=7030
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
RABBITMQ_QUEUE=alert_queue
```
