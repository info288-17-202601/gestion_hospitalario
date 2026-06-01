# 📦 Inventory Service — S.G.H

Microservicio de gestión de inventario hospitalario desarrollado en **Go** con **Gin** y **GORM**. Forma parte del nodo de departamento del Sistema de Gestión Hospitalaria (S.G.H) y es responsable de administrar el stock de insumos, registrar movimientos entre departamentos y emitir alertas automáticas vía **RabbitMQ** cuando el stock cae por debajo del mínimo configurado.

---

## 📁 Estructura del Proyecto

```
Inventory_Service/
├── cmd/
│   └── server/             # Punto de entrada de la aplicación
├── internal/
│   ├── api/
│   │   ├── router.go       # Definición de rutas HTTP
│   │   └── handlers/
│   │       └── inventory.go # Handlers HTTP de la API
│   ├── config/
│   │   └── config.go       # Carga de configuración desde variables de entorno
│   ├── db/
│   │   └── database.go     # Inicialización de la conexión a PostgreSQL con GORM
│   ├── models/
│   │   └── inventory.go    # Modelos de base de datos (GORM)
│   ├── schemas/
│   │   └── inventory.go    # Esquemas de request/response (DTOs)
│   └── services/
│       └── inventory_service.go  # Lógica de negocio
├── docs/
│   ├── docs.go             # Documentación Swagger generada
│   ├── swagger.json
│   └── swagger.yaml
├── .env                    # Variables de entorno locales
├── Dockerfile              # Imagen Docker multi-stage
└── go.mod                  # Módulo Go y dependencias
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Go 1.26** | Lenguaje principal |
| **Gin** | Framework HTTP |
| **GORM** | ORM para PostgreSQL |
| **PostgreSQL** | Base de datos relacional |
| **RabbitMQ** (`amqp091-go`) | Mensajería para alertas de stock bajo |
| **Swaggo / Swagger** | Documentación de la API |
| **Docker** | Contenerización (multi-stage build) |

---

## ⚙️ Configuración

El servicio se configura mediante variables de entorno. En desarrollo local se puede usar un archivo `.env` en la raíz del servicio.

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `POSTGRES_USER` | Usuario de PostgreSQL | _(requerido)_ |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | _(requerido)_ |
| `POSTGRES_SERVER` | Host del servidor PostgreSQL | _(requerido)_ |
| `POSTGRES_PORT` | Puerto de PostgreSQL | _(requerido)_ |
| `POSTGRES_DB` | Nombre de la base de datos | _(requerido)_ |
| `DEPARTMENT_ID` | ID del departamento al que pertenece esta instancia | `1` |
| `SERVER_PORT` | Puerto en que escucha el servidor HTTP | `7010` |
| `RABBITMQ_URL` | URL de conexión a RabbitMQ | `amqp://guest:guest@localhost:7040/` |
| `RABBITMQ_QUEUE` | Nombre de la cola de alertas | `alert_queue` |
| `PROJECT_NAME` | Nombre del proyecto | `S.G.H - Inventory Service` |

### Ejemplo `.env`

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=postgres
POSTGRES_PORT=6000
POSTGRES_DB=gestion_hospitalario
DEPARTMENT_ID=1
SERVER_PORT=7010
```

> **Nota:** La variable `DEPARTMENT_ID` identifica a qué departamento hospitalario pertenece esta instancia del servicio. Cada nodo desplegado debe tener su propio valor.

---

## 🗃️ Modelos de Base de Datos

El servicio gestiona las siguientes entidades en PostgreSQL:

### `SupplyCategory` → tabla `supply_category`
Categorías de los insumos.

| Campo | Tipo | Descripción |
|---|---|---|
| `ID` | `uint` | Clave primaria |
| `Name` | `varchar(255)` | Nombre de la categoría |
| `Description` | `text` | Descripción |

### `Supply` → tabla `supplies`
Insumos del hospital.

| Campo | Tipo | Descripción |
|---|---|---|
| `ID` | `uint` | Clave primaria |
| `InternalCode` | `varchar(50)` | Código interno único |
| `Name` | `varchar(255)` | Nombre del insumo |
| `Description` | `text` | Descripción |
| `UnitOfMeasure` | `varchar(50)` | Unidad de medida |
| `MinimumStock` | `numeric(10,2)` | Stock mínimo (umbral de alerta) |
| `CategoryID` | `uint` | FK → `supply_category` |
| `IsActive` | `bool` | Estado activo/inactivo |

### `Department` → tabla `departments`
Departamentos del hospital.

| Campo | Tipo | Descripción |
|---|---|---|
| `ID` | `uint` | Clave primaria |
| `Name` | `varchar(255)` | Nombre del departamento |
| `Location` | `varchar(255)` | Ubicación física |
| `IsActive` | `bool` | Estado activo |

### `DepartmentInventory` → tabla `department_inventory`
Stock actual de cada insumo por departamento.

| Campo | Tipo | Descripción |
|---|---|---|
| `ID` | `uint` | Clave primaria |
| `DepartmentID` | `uint` | FK → `departments` |
| `SupplyID` | `uint` | FK → `supplies` |
| `Quantity` | `numeric(10,2)` | Cantidad en stock |
| `UpdatedAt` | `timestamp` | Fecha de última actualización |

### `InventoryMovement` → tabla `inventory_movements`
Registro histórico de todos los movimientos de inventario.

| Campo | Tipo | Descripción |
|---|---|---|
| `ID` | `uint` | Clave primaria |
| `Type` | `varchar(50)` | Tipo: `entrada`, `salida`, `transferencia` |
| `Quantity` | `numeric(10,2)` | Cantidad del movimiento |
| `MovementDate` | `timestamp` | Fecha del movimiento |
| `Observations` | `text` | Observaciones adicionales |
| `UserID` | `uint` | ID del usuario que realizó la operación |
| `SupplyID` | `uint` | FK → `supplies` |
| `OriginDepartmentID` | `*uint` | FK → `departments` (nullable) |
| `DestinationDepartmentID` | `*uint` | FK → `departments` (nullable) |

---

## 🌐 API REST

Base URL: `http://localhost:7010/api/v1`

### Health Check

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Verifica que el servicio esté en línea |

**Respuesta:**
```json
{
  "status": "ok",
  "service": "Inventory Service"
}
```

---

### Categorías

#### `GET /api/v1/inventory/categories`
Retorna todas las categorías de insumos.

**Respuesta exitosa `200`:**
```json
[
  {
    "ID": 1,
    "Name": "Medicamentos",
    "Description": "Medicamentos de uso clínico"
  }
]
```

---

### Insumos

#### `GET /api/v1/inventory/supplies`
Retorna todos los insumos registrados.

#### `POST /api/v1/inventory/supplies`
Crea un nuevo insumo.

**Body:**
```json
{
  "internal_code": "MED-001",
  "name": "Paracetamol 500mg",
  "description": "Analgésico y antipirético",
  "unit_of_measure": "comprimidos",
  "minimum_stock": 100,
  "category_id": 1,
  "is_active": true
}
```

**Respuesta exitosa `201`:** objeto `Supply` creado.

#### `PUT /api/v1/inventory/supplies/:id`
Actualiza un insumo existente. Solo se actualizan los campos enviados en el body.

**Body (todos los campos son opcionales):**
```json
{
  "name": "Paracetamol 1g",
  "minimum_stock": 150,
  "is_active": false
}
```

**Errores:**
- `404` — Insumo no encontrado
- `422` — Error de validación

---

### Stock del Departamento

#### `GET /api/v1/inventory/departments/stock`
Retorna el stock actual del departamento configurado en `DEPARTMENT_ID`.

**Respuesta exitosa `200`:**
```json
[
  {
    "ID": 1,
    "DepartmentID": 1,
    "SupplyID": 3,
    "Quantity": 250.00,
    "UpdatedAt": "2026-05-31T15:00:00Z"
  }
]
```

#### `POST /api/v1/inventory/departments/stock`
Modifica el stock de un insumo en el departamento (entrada o salida). Si `quantity_change` es positivo, se registra como **entrada**; si es negativo, como **salida**.

**Body:**
```json
{
  "supply_id": 3,
  "quantity_change": -20.5,
  "observations": "Uso en cirugía de urgencia",
  "user_id": 42
}
```

**Respuesta exitosa `200`:**
```json
{
  "message": "Stock modified successfully",
  "status": "success",
  "movement_id": 15
}
```

**Errores:**
- `400` — Stock insuficiente para la operación
- `404` — Departamento o insumo no encontrado
- `422` — Error de validación del body

> ⚠️ Si el stock resultante cae por debajo de `minimum_stock`, se publica automáticamente una alerta en RabbitMQ de forma asíncrona.

---

### Movimientos

#### `GET /api/v1/inventory/movements`
Retorna todos los movimientos del departamento configurado (tanto como origen como destino), ordenados por fecha descendente.

#### `POST /api/v1/inventory/movements`
Registra una **transferencia** de insumos entre dos departamentos. La operación es atómica (usa transacciones de base de datos).

**Body:**
```json
{
  "supply_id": 3,
  "quantity": 50.0,
  "origin_department_id": 1,
  "destination_department_id": 2,
  "observations": "Transferencia por excedente",
  "user_id": 42
}
```

**Respuesta exitosa `200`:**
```json
{
  "message": "Movement registered successfully",
  "status": "success",
  "movement_id": 16
}
```

**Errores:**
- `400` — Origen y destino son iguales, o stock insuficiente en el departamento origen
- `422` — Error de validación del body

> ⚠️ Si el stock del departamento origen cae por debajo del mínimo tras la transferencia, se publica una alerta en RabbitMQ.

---

## 🔔 Sistema de Alertas (RabbitMQ)

El servicio publica mensajes en la cola configurada (`RABBITMQ_QUEUE`) cuando el stock de un insumo cae por debajo del umbral `minimum_stock`. Las alertas se publican de forma **asíncrona** (goroutine) para no bloquear la respuesta HTTP.

### Formato del Mensaje

```json
{
  "type": "low_stock",
  "message": "LOW STOCK WARNING: Supply 'Paracetamol 500mg' (Code: MED-001) has dropped below the minimum limit in department 'Emergencias'. Current: 45.00, Minimum: 100.00",
  "supply_id": 3,
  "department_id": 1
}
```

Los mensajes se publican como JSON con `ContentType: application/json` en una cola **durable**.

---

## 🐳 Docker

### Build Manual

```bash
docker build -t inventory_service ./Departamento/Inventory_Service
```

### Con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose -f docker-compose-departamento.yml up --build
```

El servicio quedará disponible en el puerto `7010` y se conectará a la red `hospital_network`.

### Dockerfile (multi-stage)

El Dockerfile usa un build de dos etapas para minimizar el tamaño de la imagen final:

1. **Builder** (`golang:1.26-alpine`): compila el binario estático.
2. **Runtime** (`alpine:latest`): imagen mínima que solo contiene el binario compilado.

El binario se expone en el puerto `7010`.

---

## 📄 Documentación Swagger

La documentación interactiva de la API está generada con **Swaggo** y se encuentra en la carpeta `docs/`. Para acceder a la UI de Swagger una vez levantado el servidor, visita:

```
http://localhost:7010/swagger/index.html
```

### Regenerar la documentación

```bash
# Instalar swag si no está instalado
go install github.com/swaggo/swag/cmd/swag@latest

# Generar desde la raíz del servicio
swag init -g cmd/server/main.go
```

---

## 🚀 Ejecución Local

### Prerrequisitos

- Go 1.26+
- PostgreSQL corriendo y accesible
- RabbitMQ corriendo (opcional, solo necesario si se requieren alertas)

### Pasos

```bash
# 1. Clonar / navegar al directorio del servicio
cd Departamento/Inventory_Service

# 2. Configurar variables de entorno
cp .env .env.local
# Editar .env con tus valores

# 3. Descargar dependencias
go mod download

# 4. Ejecutar
go run ./cmd/server
```

El servidor estará disponible en `http://localhost:7010`.

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---|---|---|
| `github.com/gin-gonic/gin` | v1.12.0 | Framework HTTP |
| `gorm.io/gorm` | v1.31.1 | ORM |
| `gorm.io/driver/postgres` | v1.6.0 | Driver PostgreSQL para GORM |
| `github.com/rabbitmq/amqp091-go` | v1.11.0 | Cliente RabbitMQ |
| `github.com/joho/godotenv` | v1.5.1 | Carga de archivos `.env` |
| `github.com/swaggo/gin-swagger` | v1.6.1 | Integración Swagger con Gin |
