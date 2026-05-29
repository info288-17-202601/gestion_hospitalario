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
INSERT INTO supply_category (id, name, description) VALUES
(1, 'Insumos Quirúrgicos', 'Materiales para operaciones y procedimientos'),
(2, 'Medicamentos', 'Fármacos de uso general y especializado'),
(3, 'Material de Curación', 'Gasa, vendas, apósitos'),
(4, 'Equipos Médicos', 'Equipamiento de diagnóstico y monitorización'),
(5, 'Insumos de Laboratorio', 'Reactivos, tubos y materiales de análisis'),
(6, 'Aseo y Limpieza', 'Productos para desinfección y limpieza hospitalaria'),
(7, 'Ropa Médica', 'Indumentaria para personal y pacientes');
SELECT setval('supply_category_id_seq', (SELECT MAX(id) FROM supply_category));

-- 2. Departamentos
INSERT INTO departments (id, name, location, is_active) VALUES
(1, 'Urgencias', 'Piso 1, Ala A', true),
(2, 'UCI', 'Piso 3, Ala B', true),
(3, 'Farmacia Central', 'Piso -1', true),
(4, 'Pediatría', 'Piso 2, Ala A', true),
(5, 'Maternidad', 'Piso 2, Ala B', true),
(6, 'Laboratorio Central', 'Piso 1, Ala B', true),
(7, 'Pabellón Quirúrgico', 'Piso 4', true),
(8, 'Administración Central', 'Piso 5', true);
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 3. Insumos
INSERT INTO supplies (id, internal_code, name, description, unit_of_measure, minimum_stock, category_id, is_active) VALUES
(1, 'INS-001', 'Jeringa 10ml', 'Jeringa desechable de 10ml sin aguja', 'Unidad', 500.00, 1, true),
(2, 'INS-002', 'Bisturí N11', 'Hoja de bisturí de acero al carbono', 'Caja x100', 50.00, 1, true),
(3, 'INS-003', 'Sutura de Seda', 'Sutura de seda trenzada 3/0', 'Caja x12', 30.00, 1, true),
(4, 'INS-004', 'Guantes Quirúrgicos', 'Guantes estériles talla 7.5', 'Caja x50', 200.00, 1, true),
(5, 'MED-001', 'Paracetamol 500mg', 'Paracetamol en comprimidos', 'Caja x20', 100.00, 2, true),
(6, 'MED-002', 'Ibuprofeno 400mg', 'Ibuprofeno en grageas', 'Caja x20', 100.00, 2, true),
(7, 'MED-003', 'Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Caja x21', 150.00, 2, true),
(8, 'MED-004', 'Suero Fisiológico', 'Solución salina 0.9% 500ml', 'Unidad', 300.00, 2, true),
(9, 'MED-005', 'Morfina 10mg/ml', 'Analgésico opioide', 'Ampolla', 50.00, 2, true),
(10, 'CUR-001', 'Gasa Estéril', 'Gasa estéril 10x10 cm', 'Paquete x5', 200.00, 3, true),
(11, 'CUR-002', 'Venda Elástica', 'Venda elástica 10cm x 5m', 'Unidad', 150.00, 3, true),
(12, 'CUR-003', 'Esparadrapo', 'Cinta adhesiva hipoalergénica', 'Rollo', 100.00, 3, true),
(13, 'EQP-001', 'Termómetro Digital', 'Termómetro clínico digital', 'Unidad', 20.00, 4, true),
(14, 'EQP-002', 'Tensiómetro', 'Esfingomanómetro aneroide', 'Unidad', 15.00, 4, true),
(15, 'LAB-001', 'Tubo de Ensayo', 'Tubo de vidrio 10ml', 'Caja x100', 50.00, 5, true),
(16, 'LAB-002', 'Pipeta Pasteur', 'Pipeta de plástico 3ml', 'Paquete x500', 20.00, 5, true),
(17, 'LAB-003', 'Reactivo Glucosa', 'Kit para determinación de glucosa', 'Kit', 10.00, 5, true),
(18, 'ASE-001', 'Alcohol Gel', 'Alcohol gel desinfectante 1L', 'Unidad', 200.00, 6, true),
(19, 'ASE-002', 'Amonio Cuaternario', 'Desinfectante de superficies 5L', 'Bidón', 50.00, 6, true),
(20, 'ROP-001', 'Mascarilla KN95', 'Mascarilla filtrante alta eficiencia', 'Caja x50', 100.00, 7, true),
(21, 'ROP-002', 'Pechera Desechable', 'Pechera impermeable', 'Paquete x10', 300.00, 7, true),
(22, 'ROP-003', 'Gorro Quirúrgico', 'Gorro desechable', 'Caja x100', 150.00, 7, true);
SELECT setval('supplies_id_seq', (SELECT MAX(id) FROM supplies));

-- 4. Usuarios (Password hasheado usando el mismo de prueba o uno estandar, asumiendo bcrypt o similar que usa la app)
INSERT INTO users (id, rut, password, name, last_name, email, phone, role, department_id, is_active) VALUES
(1, '11111111-1', 'hashed_pass_1', 'Juan', 'Pérez', 'jperez@hospital.cl', '+56912345678', 'Enfermero', 1, true),
(2, '22222222-2', 'hashed_pass_2', 'María', 'González', 'mgonzalez@hospital.cl', '+56987654321', 'Farmacéutico', 3, true),
(3, '33333333-3', 'hashed_pass_3', 'Roberto', 'Gómez', 'rgomez@hospital.cl', '+56911223344', 'Médico', 2, true),
(4, '44444444-4', 'hashed_pass_4', 'Ana', 'Silva', 'asilva@hospital.cl', '+56922334455', 'Médico', 1, true),
(5, '55555555-5', 'hashed_pass_5', 'Sofía', 'Castillo', 'scastillo@hospital.cl', '+56933445566', 'Pediatra', 4, true),
(6, '66666666-6', 'hashed_pass_6', 'Paula', 'Medina', 'pmedina@hospital.cl', '+56944556677', 'Matrona', 5, true),
(7, '77777777-7', 'hashed_pass_7', 'Jorge', 'Castro', 'jcastro@hospital.cl', '+56955667788', 'Tecnólogo Médico', 6, true),
(8, '88888888-8', 'hashed_pass_8', 'Andrés', 'Torres', 'atorres@hospital.cl', '+56966778899', 'Anestesista', 7, true),
(9, '99999999-9', 'hashed_pass_9', 'Admin', 'Central', 'admin@hospital.cl', '+56977889900', 'Administrador', 8, true);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 5. Inventario por departamento (Stock inicial)
-- Farmacia Central (Tiene de todo en grandes cantidades)
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(3, 1, 5000.00), (3, 2, 500.00), (3, 3, 200.00), (3, 4, 1000.00),
(3, 5, 2000.00), (3, 6, 2000.00), (3, 7, 1500.00), (3, 8, 3000.00), (3, 9, 300.00),
(3, 10, 1000.00), (3, 11, 500.00), (3, 12, 500.00),
(3, 13, 100.00), (3, 14, 50.00), (3, 15, 2000.00), (3, 16, 5000.00), (3, 17, 200.00),
(3, 18, 1000.00), (3, 19, 200.00), (3, 20, 3000.00), (3, 21, 2000.00), (3, 22, 5000.00);

-- Urgencias
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(1, 1, 200.00), (1, 4, 100.00), (1, 5, 100.00), (1, 6, 100.00),
(1, 8, 150.00), (1, 10, 200.00), (1, 11, 50.00), (1, 13, 10.00),
(1, 14, 5.00), (1, 18, 50.00), (1, 20, 200.00);

-- UCI
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(2, 1, 300.00), (2, 4, 150.00), (2, 8, 200.00), (2, 9, 50.00),
(2, 18, 30.00), (2, 20, 300.00), (2, 21, 200.00);

-- Laboratorio Central
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(6, 15, 500.00), (6, 16, 1000.00), (6, 17, 50.00), (6, 18, 20.00), (6, 20, 100.00);

-- Pabellón Quirúrgico
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(7, 2, 50.00), (7, 3, 30.00), (7, 4, 200.00), (7, 9, 20.00),
(7, 10, 300.00), (7, 20, 200.00), (7, 21, 150.00), (7, 22, 300.00);

-- Pediatría
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(4, 1, 50.00), (4, 5, 200.00), (4, 13, 15.00), (4, 20, 100.00);

-- Maternidad
INSERT INTO department_inventory (department_id, supply_id, quantity) VALUES
(5, 1, 100.00), (5, 4, 150.00), (5, 8, 100.00), (5, 10, 150.00), (5, 20, 100.00);

-- 6. Movimientos de prueba
INSERT INTO inventory_movements (type, quantity, observations, user_id, supply_id, origin_department_id, destination_department_id) VALUES
('entrada', 5000.00, 'Recepción inicial a farmacia central', 9, 1, NULL, 3),
('transferencia', 200.00, 'Abastecimiento a Urgencias', 2, 1, 3, 1),
('transferencia', 300.00, 'Abastecimiento a UCI', 2, 1, 3, 2),
('consumo', 10.00, 'Consumo en Urgencias por paciente X', 1, 1, 1, NULL),
('consumo', 5.00, 'Consumo en UCI', 3, 1, 2, NULL);

-- 7. Alertas de prueba (Ejemplo de stock bajo)
INSERT INTO alerts (type, message, status, supply_id, department_id) VALUES
('stock_bajo', 'El stock de Morfina en UCI está por debajo del mínimo recomendado', 'activa', 9, 2),
('stock_bajo', 'Termómetros digitales bajos en Urgencias', 'resuelta', 13, 1);

-- 8. Tarjetas RFID asociadas a usuarios
INSERT INTO rfid_cards (user_id, uid, is_active) VALUES
(1, 'UID-URG-001', true),
(2, 'UID-FAR-002', true),
(3, 'UID-UCI-003', true),
(4, 'UID-URG-004', true),
(5, 'UID-PED-005', true),
(6, 'UID-MAT-006', true),
(7, 'UID-LAB-007', true),
(8, 'UID-PAB-008', true),
(9, 'UID-ADM-009', true);

-- 9. PIN hasheado de prueba (Simulando '1234' o similar)
INSERT INTO user_pin_credentials (user_id, pin_hash) VALUES
(1, 'hash_pin_1'),
(2, 'hash_pin_2'),
(3, 'hash_pin_3'),
(4, 'hash_pin_4'),
(5, 'hash_pin_5'),
(6, 'hash_pin_6'),
(7, 'hash_pin_7'),
(8, 'hash_pin_8'),
(9, 'hash_pin_9');