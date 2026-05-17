-- Crear tabla supply_category (Sin dependencias)
CREATE TABLE supply_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Crear tabla departments (Sin dependencias)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Crear tabla supplies (Depende de supply_category)
CREATE TABLE supplies (
    id SERIAL PRIMARY KEY,
    internal_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50),
    minimum_stock NUMERIC(10, 2) NOT NULL,
    category_id INT REFERENCES supply_category(id),
    is_active BOOLEAN DEFAULT true
);

-- Crear tabla users (Depende de departments)
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
    is_active BOOLEAN DEFAULT true
);

-- Crear tabla alerts (Depende de supplies y departments)
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    supply_id INT REFERENCES supplies(id),
    department_id INT REFERENCES departments(id)
);

-- Crear tabla department_inventory (Depende de departments y supplies)
CREATE TABLE department_inventory (
    id SERIAL PRIMARY KEY,
    department_id INT REFERENCES departments(id),
    supply_id INT REFERENCES supplies(id),
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla inventory_movements (Depende de users, supplies y departments)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observations TEXT,
    user_id INT REFERENCES users(id),
    supply_id INT REFERENCES supplies(id),
    origin_department_id INT REFERENCES departments(id),
    destination_department_id INT REFERENCES departments(id)
);

-- Crear tabla rfid_cards (Depende de users)
CREATE TABLE rfid_cards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    uid VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla user_pin_credentials (Depende de users)
CREATE TABLE user_pin_credentials (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id),
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla auth_logs (Depende de users)
CREATE TABLE auth_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    auth_method VARCHAR(50) NOT NULL,
    uid_attempt VARCHAR(100),
    success BOOLEAN NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERTAR DATOS DE PRUEBA
-- ==========================================

-- 1. Categorías de insumos
INSERT INTO supply_category (name, description) VALUES
('Insumos Quirúrgicos', 'Materiales para operaciones y procedimientos'),
('Medicamentos', 'Fármacos de uso general y especializado'),
('Material de Curación', 'Gasa, vendas, apósitos');

-- 2. Departamentos
INSERT INTO departments (name, location, is_active) VALUES
('Urgencias', 'Piso 1, Ala A', true),
('UCI', 'Piso 3, Ala B', true),
('Farmacia Central', 'Piso -1', true);

-- 3. Insumos
INSERT INTO supplies (internal_code, name, description, unit_of_measure, minimum_stock, category_id, is_active) VALUES
('INS-001', 'Jeringa 10ml', 'Jeringa desechable de 10ml sin aguja', 'Unidad', 500.00, 1, true),
('MED-001', 'Paracetamol 500mg', 'Paracetamol en comprimidos', 'Caja x20', 100.00, 2, true),
('CUR-001', 'Gasa Estéril', 'Gasa estéril 10x10 cm', 'Paquete x5', 200.00, 3, true);

-- 4. Usuarios
INSERT INTO users (rut, password, name, last_name, email, phone, role, department_id, is_active) VALUES
('11111111-1', 'hashed_pass_1', 'Juan', 'Pérez', 'jperez@hospital.cl', '+56912345678', 'Enfermero', 1, true),
('22222222-2', 'hashed_pass_2', 'María', 'González', 'mgonzalez@hospital.cl', '+56987654321', 'Farmacéutico', 3, true);

-- 5. Inventario por departamento (Stock inicial)
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(3, 1, 1000.00), -- Farmacia Central tiene 1000 jeringas
(3, 2, 500.00),  -- Farmacia Central tiene 500 cajas de Paracetamol
(1, 1, 50.00),   -- Urgencias tiene 50 jeringas
(1, 3, 100.00);  -- Urgencias tiene 100 gasas

-- 6. Movimientos de prueba
INSERT INTO inventory_movements (type, quantity, observations, user_id, supply_id, origin_department_id, destination_department_id) VALUES
('entrada', 1000.00, 'Recepción inicial a farmacia', 2, 1, NULL, 3),
('transferencia', 50.00, 'Envío de jeringas a urgencias', 2, 1, 3, 1);

-- 7. Tarjeta RFID asociada a Juan Pérez
INSERT INTO rfid_cards (user_id, uid, is_active) VALUES
(1, 'A1B2C3D4', true);

-- 8. PIN hasheado de prueba
INSERT INTO user_pin_credentials (user_id, pin_hash) VALUES
(1, 'hashed_pin_1234');