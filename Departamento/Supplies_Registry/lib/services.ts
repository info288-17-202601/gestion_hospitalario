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
): Promise<{ success: boolean; user?: SessionUser; reason?: string; token?: string }> {
  try {
    const departmentId = parseInt(process.env.NEXT_PUBLIC_DEPARTMENT_ID || '1', 10)
    const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_BASE
    const res = await fetch(`${AUTH_API}/login/classic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, password, target_department_id: departmentId }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return { success: false, reason: errorData.detail || 'Credenciales inválidas' }
    }

    const data = await res.json()

    return {
      success: true,
      token: data.access_token,
      user: {
        id: data.user.id,
        name: data.user.name,
        role: data.user.role,
        department: `Departamento ${departmentId}`,
        rut: rut,
      },
    }
  } catch (error: any) {
    return { success: false, reason: 'Error de conexión' }
  }
}

export async function loginWithRfid(
  uid: string,
  pin: string
): Promise<{ success: boolean; user?: SessionUser; reason?: string }> {
  // En Supplies_Registry, la validación se hace a través de rfid_bridge.
  // Cuando rfid_bridge retorna éxito, rfid-actions extraerá el token
  // y llamará a persistSession (o similar). No es necesario llamar a la API desde aquí.
  return { success: false, reason: 'Llamar a rfid-actions directamente' }
}

// ---- Categories ----

type BackendSupplyCategory = {
  ID: number
  Name: string
  Description: string
}

function mapSupplyCategory(item: BackendSupplyCategory): SupplyCategory {
  return {
    id: item.ID,
    name: item.Name,
    description: item.Description,
  }
}

export async function getCategories(): Promise<SupplyCategory[]> {
  const res = await fetch(`${INVENTORY_API}/categories`)
  const backendData = await handleInventoryResponse<BackendSupplyCategory[]>(res)
  return backendData.map(mapSupplyCategory)
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

const INVENTORY_API = process.env.NEXT_PUBLIC_INVENTORY_API_BASE || 'http://localhost:7010/api/v1/inventory'

async function handleInventoryResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Error al comunicarse con el Inventory Service')
  }
  return res.json()
}

// ---- Supplies ----

type BackendSupply = {
  ID: number
  InternalCode: string
  Name: string
  Description: string
  UnitOfMeasure: string
  MinimumStock: number
  CategoryID: number
  IsActive: boolean
}

function mapSupply(item: BackendSupply): Supply {
  return {
    id: item.ID,
    internal_code: item.InternalCode,
    name: item.Name,
    description: item.Description,
    unit_of_measure: item.UnitOfMeasure,
    minimum_stock: item.MinimumStock,
    category_id: item.CategoryID,
    is_active: item.IsActive,
  }
}

export async function getSupplies(): Promise<Supply[]> {
  const res = await fetch(`${INVENTORY_API}/supplies`)
  const backendData = await handleInventoryResponse<BackendSupply[]>(res)
  return backendData.map(mapSupply)
}

export async function createSupply(data: Omit<Supply, 'id'>): Promise<Supply> {
  const res = await fetch(`${INVENTORY_API}/supplies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleInventoryResponse<Supply>(res)
}

export async function updateSupply(id: number, data: Partial<Omit<Supply, 'id'>>): Promise<Supply> {
  const res = await fetch(`${INVENTORY_API}/supplies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleInventoryResponse<Supply>(res)
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

type BackendDepartmentInventory = {
  ID: number
  DepartmentID: number
  SupplyID: number
  Quantity: number
  UpdatedAt: string
}

function mapDepartmentInventory(item: BackendDepartmentInventory): DepartmentInventory {
  return {
    id: item.ID,
    department_id: item.DepartmentID,
    supply_id: item.SupplyID,
    quantity: item.Quantity,
    minimum_stock: 0, // Will be populated from supplies data
  }
}

export async function getDepartmentInventory(): Promise<DepartmentInventory[]> {
  const res = await fetch(`${INVENTORY_API}/departments/stock`)
  const backendData = await handleInventoryResponse<BackendDepartmentInventory[]>(res)

  // Get supplies to populate minimum_stock
  const suppliesData = await getSupplies()
  const supplyMap = new Map(suppliesData.map(s => [s.id, s]))

  return backendData.map(item => {
    const mapped = mapDepartmentInventory(item)
    const supply = supplyMap.get(item.SupplyID)
    if (supply) {
      mapped.minimum_stock = supply.minimum_stock
    }
    return mapped
  })
}

// ---- Inventory Movements ----

type BackendInventoryMovement = {
  ID: number
  Type: string
  Quantity: number
  MovementDate: string
  Observations: string
  UserID: number
  SupplyID: number
  OriginDepartmentID: number | null
  DestinationDepartmentID: number | null
}

function mapInventoryMovement(item: BackendInventoryMovement): InventoryMovement {
  return {
    id: item.ID,
    type: item.Type as MovementType,
    quantity: item.Quantity,
    created_at: item.MovementDate,
    supply_id: item.SupplyID,
    user_id: item.UserID,
    source_department_id: item.OriginDepartmentID,
    destination_department_id: item.DestinationDepartmentID,
    observations: item.Observations,
  }
}

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const res = await fetch(`${INVENTORY_API}/movements`)
  const backendData = await handleInventoryResponse<BackendInventoryMovement[]>(res)
  return backendData.map(mapInventoryMovement)
}

export async function createMovement(data: {
  supply_id: number
  quantity: number
  source_department_id: number
  destination_department_id: number
  observations: string
  user_id: number
}): Promise<InventoryMovement> {
  const payload = {
    supply_id: data.supply_id,
    quantity: data.quantity,
    origin_department_id: data.source_department_id,
    destination_department_id: data.destination_department_id,
    observations: data.observations,
    user_id: data.user_id,
  }

  const res = await fetch(`${INVENTORY_API}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return handleInventoryResponse<InventoryMovement>(res)
}

export async function modifyDepartmentStock(data: {
  supply_id: number
  quantity_change: number
  observations: string
  user_id: number
}): Promise<InventoryMovement> {
  const res = await fetch(`${INVENTORY_API}/departments/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleInventoryResponse<InventoryMovement>(res)
}

// ---- RFID Cards ----

export async function getRfidCards(): Promise<RfidCard[]> {
  return [...rfidCards]
}

// ---- Auth Logs ----

export async function getAuthLogs(): Promise<AuthLog[]> {
  return [...authLogs]
}
