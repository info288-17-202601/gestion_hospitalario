# Authentication Service

This is the backend service responsible for user authentication within the Central Hospital Management System. It supports dual login methods and issues JWT tokens upon successful authentication.

## Supported Login Methods
- **Classic Login**: Login using `rut` and `password`.
- **RFID Login**: Login using an RFID card `uid` and a user `pin`.

## Configuration

To run this project, you need to set up a `.env` file in the root of the `Authentication` directory. 

### Environment Variables (.env)

The following parameters must be specified in the `.env` file for the application to run properly:

- `POSTGRES_USER`: The username used to authenticate with the PostgreSQL database.
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database user.
- `POSTGRES_SERVER`: The hostname or IP address of the PostgreSQL database.
- `POSTGRES_PORT`: The port number on which the PostgreSQL database is listening.
- `POSTGRES_DB`: The name of the target database.
- `JWT_SECRET`: The secret key used to sign the JWT tokens. Change this in production!

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
go build -o auth_service_bin ./cmd/server
```

### 4. Run the Service

Execute the compiled binary:

```bash
./auth_service_bin
```

### 5. View Documentation

Once the server is running, visit the interactive Swagger UI documentation at:
[http://localhost:7050/docs/index.html](http://localhost:7050/docs/index.html)
