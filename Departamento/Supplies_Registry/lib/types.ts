// ============================================================
// Types aligned with the database schema
// ============================================================

export type SupplyCategory = {
  id: number
  name: string
  description: string
}

export type Department = {
  id: number
  name: string
  location: string
  is_active: boolean
}

export type Supply = {
  id: number
  internal_code: string
  name: string
  description: string
  unit_of_measure: string
  minimum_stock: number
  category_id: number
  is_active: boolean
}

export type UserRole = 'Administrador' | 'Enfermero' | 'Farmacéutico' | 'Bodega' | 'Jefatura'

export type User = {
  id: number
  rut: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: UserRole
  department_id: number
  is_active: boolean
  password_hash?: string
}

export type AlertType = 'bajo_stock' | 'error_sistema' | 'autenticacion' | 'inventario'
export type AlertStatus = 'pendiente' | 'revisada' | 'resuelta'

export type Alert = {
  id: number
  type: AlertType
  message: string
  created_at: string
  status: AlertStatus
  supply_id: number | null
  department_id: number | null
}

export type DepartmentInventory = {
  id: number
  department_id: number
  supply_id: number
  quantity: number
  minimum_stock: number
}

export type MovementType = 'entrada' | 'salida' | 'transferencia' | 'ajuste'

export type InventoryMovement = {
  id: number
  type: MovementType
  quantity: number
  created_at: string
  supply_id: number
  user_id: number
  source_department_id: number | null
  destination_department_id: number | null
  observations: string
}

export type RfidCard = {
  id: number
  user_id: number
  uid: string
  is_active: boolean
  created_at: string
}

export type UserPinCredential = {
  id: number
  user_id: number
  pin_hash: string
  is_configured: boolean
}

export type AuthMethod = 'password' | 'rfid_pin'
export type AuthResult = 'exitoso' | 'fallido'

export type AuthLog = {
  id: number
  user_id: number | null
  method: AuthMethod
  uid_used: string | null
  result: AuthResult
  reason: string | null
  created_at: string
}

// ============================================================
// Session context type
// ============================================================
export type SessionUser = {
  id: number
  name: string
  role: UserRole
  department: string
  rut: string
}
