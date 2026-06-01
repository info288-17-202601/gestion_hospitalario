import type {
  SupplyCategory,
  Department,
  Supply,
  User,
  Alert,
  DepartmentInventory,
  InventoryMovement,
  RfidCard,
  UserPinCredential,
  AuthLog,
} from './types'

// ============================================================
// supply_category
// ============================================================
export let categories: SupplyCategory[] = [
  { id: 1, name: 'Insumos Quirúrgicos', description: 'Materiales utilizados en procedimientos quirúrgicos' },
  { id: 2, name: 'Medicamentos', description: 'Fármacos y medicamentos de uso clínico' },
  { id: 3, name: 'Material de Curación', description: 'Materiales para curación y vendaje de heridas' },
]

// ============================================================
// departments
// ============================================================
export let departments: Department[] = [
  { id: 1, name: 'Urgencias', location: 'Piso 1 - Ala A', is_active: true },
  { id: 2, name: 'UCI', location: 'Piso 3 - Ala B', is_active: true },
  { id: 3, name: 'Farmacia Central', location: 'Piso 0 - Ala C', is_active: true },
]

// ============================================================
// supplies
// ============================================================
export let supplies: Supply[] = [
  {
    id: 1,
    internal_code: 'INS-001',
    name: 'Jeringa 10ml',
    description: 'Jeringa desechable de 10ml con aguja',
    unit_of_measure: 'Unidad',
    minimum_stock: 500,
    category_id: 1,
    is_active: true,
  },
  {
    id: 2,
    internal_code: 'MED-001',
    name: 'Paracetamol 500mg',
    description: 'Analgésico y antipirético en comprimidos',
    unit_of_measure: 'Caja x20',
    minimum_stock: 100,
    category_id: 2,
    is_active: true,
  },
  {
    id: 3,
    internal_code: 'CUR-001',
    name: 'Gasa Estéril',
    description: 'Gasa estéril para curación de heridas',
    unit_of_measure: 'Paquete x5',
    minimum_stock: 200,
    category_id: 3,
    is_active: true,
  },
]

// ============================================================
// users
// ============================================================
export let users: User[] = [
  {
    id: 1,
    rut: '12.345.678-9',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'jperez@hospital.cl',
    phone: '+56 9 1234 5678',
    role: 'Enfermero',
    department_id: 1,
    is_active: true,
  },
  {
    id: 2,
    rut: '98.765.432-1',
    first_name: 'María',
    last_name: 'González',
    email: 'mgonzalez@hospital.cl',
    phone: '+56 9 8765 4321',
    role: 'Farmacéutico',
    department_id: 3,
    is_active: true,
  },
  {
    id: 3,
    rut: '11.222.333-4',
    first_name: 'Carlos',
    last_name: 'Morales',
    email: 'cmorales@hospital.cl',
    phone: '+56 9 1111 2222',
    role: 'Administrador',
    department_id: 2,
    is_active: true,
  },
]

// ============================================================
// alerts
// ============================================================
export let alerts: Alert[] = [
  {
    id: 1,
    type: 'bajo_stock',
    message: 'Jeringa 10ml en Urgencias bajo el stock mínimo (50 / 500)',
    created_at: '2025-05-16T08:30:00Z',
    status: 'pendiente',
    supply_id: 1,
    department_id: 1,
  },
  {
    id: 2,
    type: 'autenticacion',
    message: 'Intento de acceso fallido con UID desconocido: FFFFFFFF',
    created_at: '2025-05-16T09:15:00Z',
    status: 'revisada',
    supply_id: null,
    department_id: null,
  },
  {
    id: 3,
    type: 'inventario',
    message: 'Transferencia de 50 jeringas de Farmacia Central a Urgencias registrada.',
    created_at: '2025-05-15T14:00:00Z',
    status: 'resuelta',
    supply_id: 1,
    department_id: 1,
  },
  {
    id: 4,
    type: 'bajo_stock',
    message: 'Gasa Estéril en Urgencias bajo el stock mínimo (100 / 200)',
    created_at: '2025-05-17T07:00:00Z',
    status: 'pendiente',
    supply_id: 3,
    department_id: 1,
  },
]

// ============================================================
// department_inventory
// ============================================================
export let departmentInventory: DepartmentInventory[] = [
  { id: 1, department_id: 3, supply_id: 1, quantity: 950, minimum_stock: 500 }, // Farmacia: jeringas
  { id: 2, department_id: 3, supply_id: 2, quantity: 500, minimum_stock: 100 }, // Farmacia: paracetamol
  { id: 3, department_id: 1, supply_id: 1, quantity: 50,  minimum_stock: 500 }, // Urgencias: jeringas
  { id: 4, department_id: 1, supply_id: 3, quantity: 100, minimum_stock: 200 }, // Urgencias: gasas
]

// ============================================================
// inventory_movements
// ============================================================
export let inventoryMovements: InventoryMovement[] = [
  {
    id: 1,
    type: 'entrada',
    quantity: 1000,
    created_at: '2025-05-10T10:00:00Z',
    supply_id: 1,
    user_id: 2,
    source_department_id: null,
    destination_department_id: 3,
    observations: 'Ingreso inicial de jeringas al stock de Farmacia Central',
  },
  {
    id: 2,
    type: 'transferencia',
    quantity: 50,
    created_at: '2025-05-14T15:30:00Z',
    supply_id: 1,
    user_id: 1,
    source_department_id: 3,
    destination_department_id: 1,
    observations: 'Transferencia de jeringas a Urgencias por déficit de stock',
  },
  {
    id: 3,
    type: 'entrada',
    quantity: 500,
    created_at: '2025-05-10T10:30:00Z',
    supply_id: 2,
    user_id: 2,
    source_department_id: null,
    destination_department_id: 3,
    observations: 'Ingreso de paracetamol al stock de Farmacia Central',
  },
  {
    id: 4,
    type: 'salida',
    quantity: 20,
    created_at: '2025-05-16T11:00:00Z',
    supply_id: 2,
    user_id: 2,
    source_department_id: 3,
    destination_department_id: null,
    observations: 'Despacho de paracetamol a paciente ambulatorio',
  },
]

// ============================================================
// rfid_cards
// ============================================================
export let rfidCards: RfidCard[] = [
  {
    id: 1,
    user_id: 1,
    uid: 'A1B2C3D4',
    is_active: true,
    created_at: '2025-01-15T09:00:00Z',
  },
]

// ============================================================
// user_pin_credentials
// ============================================================
export let userPinCredentials: UserPinCredential[] = [
  {
    id: 1,
    user_id: 1,
    pin_hash: '$2b$12$hashedpin',
    is_configured: true,
  },
]

// ============================================================
// auth_logs
// ============================================================
export let authLogs: AuthLog[] = [
  {
    id: 1,
    user_id: 1,
    method: 'rfid_pin',
    uid_used: 'A1B2C3D4',
    result: 'exitoso',
    reason: null,
    created_at: '2025-05-17T08:00:00Z',
  },
  {
    id: 2,
    user_id: null,
    method: 'rfid_pin',
    uid_used: 'FFFFFFFF',
    result: 'fallido',
    reason: 'UID no registrado en el sistema',
    created_at: '2025-05-16T09:15:00Z',
  },
  {
    id: 3,
    user_id: 2,
    method: 'password',
    uid_used: null,
    result: 'exitoso',
    reason: null,
    created_at: '2025-05-16T07:45:00Z',
  },
  {
    id: 4,
    user_id: 3,
    method: 'password',
    uid_used: null,
    result: 'fallido',
    reason: 'Contraseña incorrecta',
    created_at: '2025-05-15T22:10:00Z',
  },
  {
    id: 5,
    user_id: 3,
    method: 'password',
    uid_used: null,
    result: 'exitoso',
    reason: null,
    created_at: '2025-05-15T22:11:00Z',
  },
]

// ============================================================
// Mock credentials for login
// ============================================================
export const mockCredentials = [
  { rut: '12.345.678-9', password: '1234', userId: 1 },
  { rut: '98.765.432-1', password: '1234', userId: 2 },
  { rut: '11.222.333-4', password: 'admin', userId: 3 },
]

export const mockRfidCredentials = [
  { uid: 'A1B2C3D4', pin: '1234', userId: 1 },
]

// ============================================================
// Counter for new IDs
// ============================================================
let _nextId = 100
export const nextId = () => ++_nextId
