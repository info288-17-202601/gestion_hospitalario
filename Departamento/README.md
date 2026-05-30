# Department Configuration & Documentation

This directory contains the services and configurations deployed at the hospital department nodes:
- **Inventory Service (`Inventory_Service`)**: A Go backend service that manages local stock levels, registers inventory movements, validates minimum stock limits, and publishes alerts to RabbitMQ when stocks fall below the safety threshold.

To simplify deployment and integration with the central hospital infrastructure, this document outlines all the environment configurations needed for the department.

---

## Environment Variables (`.env`)

The department services rely on a `.env` configuration file to establish database connections and network communication with the central message broker.

### 1. Database Configuration (PostgreSQL Connection)
Although the PostgreSQL database resides centrally, the department backend needs full connection parameters to read/write department-specific stock:
* **`POSTGRES_DB`**: Name of the target database (e.g., `gestion_hospitalario`).
* **`POSTGRES_USER`**: Database username (e.g., `postgres`).
* **`POSTGRES_PASSWORD`**: Database password.
* **`POSTGRES_SERVER`**: The server hostname or IP address of the database. During Docker-based execution, this should point to `postgres`. If running directly on the host, use `localhost`.
* **`POSTGRES_PORT`**: Port number of the database service (e.g., `6000`).

### 2. Department Identity
* **`DEPARTMENT_ID`**: The unique integer identifier representing this specific hospital department node (e.g., `1`). This restricts inventory actions and reporting to the assigned department.

### 3. Messaging Settings (RabbitMQ)
Used by the Inventory Service to publish alerts to the queue whenever stock drops below the required minimum level:
* **`RABBITMQ_URL`**: Full AMQP connection URI pointing to the central RabbitMQ broker (e.g., `amqp://guest:guest@rabbitmq:5672/` or `amqp://guest:guest@localhost:5672/`).
* **`RABBITMQ_QUEUE`**: The destination queue name where low-stock and movement alerts will be published (e.g., `alert_queue`).

---

## Unified `.env` Example

Create a `.env` file inside `/Departamento/Inventory_Service/.env` using the template below:

```env
# Database connection settings
POSTGRES_DB=gestion_hospitalario
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=postgres
POSTGRES_PORT=6000

# Department node identifier
DEPARTMENT_ID=1

# RabbitMQ configuration for alerts publishing
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
RABBITMQ_QUEUE=alert_queue
```
