# Reporting Service

This is the backend service for generating reports related to the department inventory within the Hospital Management System (S.G.H).

## Configuration

To run this project, you need to set up a `.env` file in the root of the `Reporting_Service` directory. This file will hold the environment variables necessary for connecting to the database and setting other project-level configurations.

### Environment Variables (.env)

The following parameters must be specified in the `.env` file for the application to run properly:

- `POSTGRES_USER`: The username used to authenticate with the PostgreSQL database (e.g., `postgres`).
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database user (e.g., `postgres`).
- `POSTGRES_SERVER`: The hostname or IP address of the PostgreSQL database. Use `localhost` if running outside of Docker, or the container name (e.g., `postgres` or the specific docker-compose service name) if running inside a Docker network.
- `POSTGRES_PORT`: The port number on which the PostgreSQL database is listening (e.g., `5432`). Note that if running against docker locally you may map it differently, so adjust accordingly.
- `POSTGRES_DB`: The name of the target database (e.g., `gestion_hospitalario`).
- `DEPARTMENT_ID`: The fixed ID of the department this service instance belongs to (e.g., `1`). This is injected securely so users cannot modify stock of other departments.

### Example `.env` file

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gestion_hospitalario
DEPARTMENT_ID=1
```

## Building and Running the Application

This service is built using **Go (Golang)**. Follow these steps to build and run the project:

### 1. Install Dependencies

First, download all the required Go modules and the Swagger CLI tool:

```bash
# Download project dependencies
go mod tidy
go mod download

# Install Swaggo CLI (required to generate API documentation)
go install github.com/swaggo/swag/cmd/swag@latest
```

> **Note:** Ensure your `~/go/bin` (or `$(go env GOPATH)/bin`) is added to your system's `PATH` to run the `swag` command easily.

### 2. Generate Swagger Documentation

Before building the project, whenever you modify handler comments, you must regenerate the Swagger documentation:

```bash
# If swag is in your PATH:
swag init -g cmd/server/main.go

# If swag is NOT in your PATH:
$(go env GOPATH)/bin/swag init -g cmd/server/main.go
```

This will create/update the `docs/` folder containing the `swagger.json` and `swagger.yaml` files.

### 3. Compile the Application

Build the Go binary to ensure optimal performance:

```bash
go build -o reporting_service_bin ./cmd/server/main.go
```

### 4. Run the Service

Execute the compiled binary:

```bash
./reporting_service_bin
```

### 5. View Documentation

Once the server is running, visit the interactive Swagger UI documentation at:
[http://localhost:7020/docs/index.html](http://localhost:7020/docs/index.html)
