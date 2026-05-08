-- 1. Crear tabla supply_category (Sin dependencias)
CREATE TABLE supply_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 2. Crear tabla departments (Sin dependencias)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_active BOOLEAN
);

-- 3. Crear tabla supplies (Depende de supply_category)
CREATE TABLE supplies (
    id SERIAL PRIMARY KEY,
    internal_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50),
    minimum_stock NUMERIC(10, 2) NOT NULL,
    category_id INT REFERENCES supply_category(id),
    is_active BOOLEAN
);

-- 4. Crear tabla users (Depende de departments)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    department_id INT REFERENCES departments(id),
    is_active BOOLEAN
);

-- 5. Crear tabla alerts (Depende de supplies y departments)
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP,
    status VARCHAR(20),
    supply_id INT REFERENCES supplies(id),
    department_id INT REFERENCES departments(id)
);

-- 6. Crear tabla department_inventory (Depende de departments y supplies)
CREATE TABLE department_inventory (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id),
    supply_id INT REFERENCES supplies(id),
    quantity NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP
);

-- 7. Crear tabla inventory_movements (Depende de users, supplies y departments)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    movement_date TIMESTAMP,
    observations TEXT,
    user_id INT REFERENCES users(id),
    supply_id INT REFERENCES supplies(id),
    origin_department_id INT REFERENCES departments(id),
    destination_department_id INT REFERENCES departments(id)
);