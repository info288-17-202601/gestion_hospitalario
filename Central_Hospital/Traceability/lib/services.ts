/**
 * Service layer — replace these functions with real API calls (FastAPI) later.
 * All functions are async to simulate future network requests.
 */

import {
  categories,
  departments,
  supplies,
  users,
  alerts,
  departmentInventory,
  inventoryMovements,
  rfidCards,
  userPinCredentials,
  authLogs,
  mockCredentials,
  mockRfidCredentials,
  nextId,
} from './mock-data'

import type {
  SupplyCategory,
  Department,
  Supply,
  User,
  Alert,
  AlertStatus,
  DepartmentInventory,
  InventoryMovement,
  MovementType,
  RfidCard,
  AuthLog,
  SessionUser,
} from './types'

// ---- Auth ----

export async function loginWithPassword(
  rut: string,
  password: string
): Promise<{ success: boolean; user?: SessionUser; reason?: string }> {
  const cred = mockCredentials.find((c) => c.rut === rut && c.password === password)
  if (!cred) return { success: false, reason: 'Credenciales inválidas' }
  const user = users.find((u) => u.id === cred.userId)
  if (!user) return { success: false, reason: 'Usuario no encontrado' }
  if (!user.is_active) return { success: false, reason: 'Usuario inactivo' }
  const dept = departments.find((d) => d.id === user.department_id)
  return {
    success: true,
    user: {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      department: dept?.name ?? 'Sin departamento',
      rut: user.rut,
    },
  }
}

export async function loginWithRfid(
  uid: string,
  pin: string
): Promise<{ success: boolean; user?: SessionUser; reason?: string }> {
  const cred = mockRfidCredentials.find((c) => c.uid === uid && c.pin === pin)
  if (!cred) return { success: false, reason: 'UID o PIN inválido' }
  const user = users.find((u) => u.id === cred.userId)
  if (!user) return { success: false, reason: 'Usuario no encontrado' }
  if (!user.is_active) return { success: false, reason: 'Usuario inactivo' }
  const dept = departments.find((d) => d.id === user.department_id)
  return {
    success: true,
    user: {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      department: dept?.name ?? 'Sin departamento',
      rut: user.rut,
    },
  }
}

// ---- Categories ----

export async function getCategories(): Promise<SupplyCategory[]> {
  return [...categories]
}

export async function createCategory(data: Omit<SupplyCategory, 'id'>): Promise<SupplyCategory> {
  const item: SupplyCategory = { id: nextId(), ...data }
  categories.push(item)
  return item
}

export async function updateCategory(id: number, data: Partial<Omit<SupplyCategory, 'id'>>): Promise<SupplyCategory> {
  const idx = categories.findIndex((c) => c.id === id)
  categories[idx] = { ...categories[idx], ...data }
  return categories[idx]
}

export async function deleteCategory(id: number): Promise<void> {
  const idx = categories.findIndex((c) => c.id === id)
  if (idx !== -1) categories.splice(idx, 1)
}

// ---- Departments ----

export async function getDepartments(): Promise<Department[]> {
  return [...departments]
}

export async function createDepartment(data: Omit<Department, 'id'>): Promise<Department> {
  const item: Department = { id: nextId(), ...data }
  departments.push(item)
  return item
}

export async function updateDepartment(id: number, data: Partial<Omit<Department, 'id'>>): Promise<Department> {
  const idx = departments.findIndex((d) => d.id === id)
  departments[idx] = { ...departments[idx], ...data }
  return departments[idx]
}

// ---- Supplies ----

export async function getSupplies(): Promise<Supply[]> {
  return [...supplies]
}

export async function createSupply(data: Omit<Supply, 'id'>): Promise<Supply> {
  const item: Supply = { id: nextId(), ...data }
  supplies.push(item)
  return item
}

export async function updateSupply(id: number, data: Partial<Omit<Supply, 'id'>>): Promise<Supply> {
  const idx = supplies.findIndex((s) => s.id === id)
  supplies[idx] = { ...supplies[idx], ...data }
  return supplies[idx]
}

// ---- Users ----

export async function getUsers(): Promise<User[]> {
  return [...users]
}

export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const item: User = { id: nextId(), ...data }
  users.push(item)
  return item
}

export async function updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User> {
  const idx = users.findIndex((u) => u.id === id)
  users[idx] = { ...users[idx], ...data }
  return users[idx]
}

// ---- Alerts ----

export async function getAlerts(): Promise<Alert[]> {
  return [...alerts]
}

export async function updateAlertStatus(id: number, status: AlertStatus): Promise<Alert> {
  const idx = alerts.findIndex((a) => a.id === id)
  alerts[idx] = { ...alerts[idx], status }
  return alerts[idx]
}

// ---- Department Inventory ----

export async function getDepartmentInventory(): Promise<DepartmentInventory[]> {
  return [...departmentInventory]
}

// ---- Inventory Movements ----

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  return [...inventoryMovements]
}

export async function createMovement(data: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement> {
  const item: InventoryMovement = {
    id: nextId(),
    created_at: new Date().toISOString(),
    ...data,
  }
  inventoryMovements.unshift(item)
  return item
}

// ---- RFID Cards ----

export async function getRfidCards(): Promise<RfidCard[]> {
  return [...rfidCards]
}

// ---- Auth Logs ----

export async function getAuthLogs(): Promise<AuthLog[]> {
  return [...authLogs]
}
