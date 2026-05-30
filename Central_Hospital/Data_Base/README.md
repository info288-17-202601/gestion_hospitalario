# Database Configuration - Central Server

This directory contains the configuration and initialization scripts for the PostgreSQL database of the Hospital Management System.

## Environment Variables

The database uses a `.env` file to configure the credentials and database name at the container level. These variables are automatically loaded by the `postgres` service in `docker-compose-central-hospital.yml`.

### Variable Descriptions

* **`POSTGRES_DB`**: The name of the initial database that will be automatically created when the container starts for the first time.
* **`POSTGRES_USER`**: The username of the PostgreSQL administrator (superuser).
* **`POSTGRES_PASSWORD`**: The secret password assigned to the administrator user specified in `POSTGRES_USER`.

---

## Example `.env` file

Create a file named `.env` in this directory (`Central_Hospital/Data_Base/.env`) with the following structure:

```env
# Name of the database to be created
POSTGRES_DB=gestion_hospitalario

# Superuser access credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```