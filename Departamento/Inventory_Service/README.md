# Inventory Service

This is the backend service for managing the department inventory within the Hospital Management System (S.G.H).

## Configuration

To run this project, you need to set up a `.env` file in the root of the `Inventory_Service` directory. This file will hold the environment variables necessary for connecting to the database and setting other project-level configurations.

### Environment Variables (.env)

The following parameters must be specified in the `.env` file for the application to run properly:

- `POSTGRES_USER`: The username used to authenticate with the PostgreSQL database (e.g., `postgres`).
- `POSTGRES_PASSWORD`: The password for the PostgreSQL database user (e.g., `postgres`).
- `POSTGRES_SERVER`: The hostname or IP address of the PostgreSQL database. Use `localhost` if running outside of Docker, or the container name (e.g., `postgres` or the specific docker-compose service name) if running inside a Docker network.
- `POSTGRES_PORT`: The port number on which the PostgreSQL database is listening (e.g., `5432`). Note that if running against docker locally you may map it differently, so adjust accordingly.
- `POSTGRES_DB`: The name of the target database (e.g., `gestion_hospitalario`).

### Example `.env` file

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gestion_hospitalario
```

## Running the Application

1. Make sure you have your dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Visit the automatic interactive API documentation (Swagger UI) at:
   [http://localhost:8000/docs](http://localhost:8000/docs)
