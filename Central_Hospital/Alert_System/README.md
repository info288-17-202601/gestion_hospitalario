# Alert System Service

This is the backend service for processing and distributing real-time alerts within the Hospital Management System (S.G.H). It consumes stock and inventory events from RabbitMQ, persists them to PostgreSQL, and broadcasts them instantly to web clients via WebSockets.

## Configuration

To run this project, you need to set up a `.env` file in the root of the `Alert_System` directory. This file will hold the environment variables necessary for connecting to the database, RabbitMQ, and setting other service configurations.

### Environment Variables (.env)

The following parameters must be specified in the `.env` file for the application to run properly:

- `PROJECT_NAME`: The display name of this microservice (e.g., `Central Hospital - Alert Service`).
- `PORT`: The port number on which the Go HTTP server will listen (e.g., `7030`).
- `POSTGRES_USER`: The username used to authenticate with the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database user.
- `POSTGRES_SERVER`: The host or IP address of the PostgreSQL database. Use `localhost` if running outside of Docker, or the container name (`postgres`) if running inside a Docker network.
- `POSTGRES_PORT`: The port number on which the PostgreSQL database is listening (e.g., `6000`).
- `POSTGRES_DB`: The name of the target database (e.g., `gestion_hospitalario`).
- `RABBITMQ_URL`: The full connection string/URL for the RabbitMQ broker (e.g., `amqp://guest:guest@localhost:5672/`).
- `RABBITMQ_QUEUE`: The name of the queue to listen to and consume alert messages from (e.g., `alert_queue`).

### Example `.env` file

```env
PROJECT_NAME="Central Hospital - Alert Service"
PORT=7030
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=6000
POSTGRES_DB=gestion_hospitalario
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_QUEUE=alert_queue
```

## Building and Running the Application

This service is built using **Go (Golang)**. Follow these steps to build and run the project:

### 1. Install Dependencies

First, download all the required Go modules:

```bash
# Download and tidy project dependencies
go mod tidy
go mod download
```

### 2. Compile the Application

Build the Go binary to ensure optimal performance:

```bash
go build -o alert_system_bin ./cmd/server
```

### 3. Run the Service

Execute the compiled binary:

```bash
./alert_system_bin
```

## WebSocket Connection

Once the server is running (port `7030`), frontend clients can establish a live duplex communication WebSocket using the following URL path:
`ws://localhost:7030/api/v1/alert/ws`
