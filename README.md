# Distributed Hospital Management System (S.G.H)

This repository contains a distributed microservice system for managing medical supply logistics at Hospital Base Valdivia. It records local department inventory movements, monitors stock levels, generates low-stock alerts, and implements user and 2FA RFID card authentication.

---

## Project Overview & Objectives

Traditionally, Hospital Base Valdivia faced several logistics problems:
* **Lack of Traceability**: Difficulty in tracking the use and destination of medical supplies.
* **Risk of Stockouts**: Inconsistencies leading to supply shortages in some clinical departments and surpluses in others.
* **Economic Losses**: Inefficient planning resulting in expired medical products.

### Project Objective
The objective of the S.G.H (Sistema de Gestión Hospitalaria) is to digitalize the hospital's supply workflows. It provides a distributed system where each clinical department operates with local autonomy over its stock, while consolidating transactional data and alerts at a central server.

---

## Service Breakdown & Modules

The project is structured into two main directories:

### 1. Central Hospital Core (`Central_Hospital/`)
* **Database (`Data_Base`)**: PostgreSQL database storing catalogs, stock state, and audit logs.
* **Authentication Service (`Authentication`)**: FastAPI service validating user credentials and RFID tags, and issuing JWT tokens.
* **Alert System (`Alert_System`)**: Service consuming alerts from RabbitMQ and exposing them via WebSockets.
* **Reporting Service (`Reporting_service`)**: FastAPI service compiling inventory reports and movement history.
* **Traceability Dashboard (`Traceability`)**: Next.js dashboard displaying global inventory status and active alerts.
* Read more: [Central Hospital Documentation `Central_Hospital/README.md`](Central_Hospital/README.md)

### 2. Department Nodes (`Departamento/`)
* **Inventory Service (`Inventory_Service`)**: Replicated Go REST API managing department-specific stock, validating safety margins, and publishing warnings to RabbitMQ.
* **Supplies Registry Module (`Supplies_Registry`)**: Next.js user interface for clinical staff to view stock, request items, and log consumption.
* **RFID Bridge (`rfid_bridge`)**: Go application acting as an intermediary between a physical RFID serial reader and the central authentication service.
* Read more: [Department Node Documentation `Departamento/README.md`](Departamento/README.md) & [RFID Bridge Documentation `Departamento/rfid_bridge/README.md`](Departamento/rfid_bridge/README.md)

---

## Docker Compose Deployment Tutorial

This project uses Docker Compose to deploy the central infrastructure and the department nodes.

### Prerequisites
1. Docker Engine and Docker Compose installed.
2. Configuration files:
   - Create a central .env at `Central_Hospital/.env` using the template in the [Central Hospital README](Central_Hospital/README.md).
   - Create a department .env at `Departamento/.env` using the template in the [Department Node README](Departamento/README.md).

> [!IMPORTANT]
> Change the default environment variables when deploying in production

### Step 1: Start Central Hospital
To deploy the database, authentication, message broker, alert system, and reporting service:

1. Navigate to the project root directory.
2. Run the compose file:
   ```bash
   docker-compose -f docker-compose-central-hospital.yml up --build -d
   ```
3. Check status:
   ```bash
   docker-compose -f docker-compose-central-hospital.yml ps
   ```


### Step 2: Start Department Node
To deploy the localized inventory system and local UI for clinical staff:

1. Ensure the central services are running.
2. Run the department compose file:
   ```bash
   docker-compose -f docker-compose-departamento.yml up --build -d
   ```
3. Check status:
   ```bash
   docker-compose -f docker-compose-departamento.yml ps
   ```

---

## Port Mappings & Infrastructure Access

The following table lists the addresses to access the deployed services:

| Service / Interface | Port | Endpoint URL / Credentials |
| :--- | :--- | :--- |
| **API Gateway (Nginx)** | `80` | `http://localhost/` |
| **Traceability Dashboard** | `8020` | `http://localhost:8020` |
| **Supplies Registry UI** | `8010` | `http://localhost:8010` |
| **PostgreSQL Database** | `6000` | Host: `localhost`, User/Pass: `postgres`/`postgres` |
| **RabbitMQ Broker** | `7040` / `15672` | Management: `http://localhost:15672` (`guest`/`guest`) |
| **Authentication Service** | `7050` | `http://localhost:7050` |
| **Alert System (WS/HTTP)** | `7030` | `http://localhost:7030` |
| **Reporting Service** | `7020` | `http://localhost:7020` |
| **Local Inventory Service** | `7010` | `http://localhost:7010` |

---

## Stopping the Containers

To stop the running containers:

* **Central Server**:
  ```bash
  docker-compose -f docker-compose-central-hospital.yml down
  ```
* **Department Node**:
  ```bash
  docker-compose -f docker-compose-departamento.yml down
  ```

Add `-v` to the commands if you wish to remove persistent database volumes.
