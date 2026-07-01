'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, PlusCircle, CheckCircle } from 'lucide-react'
import { departments } from '@/lib/mock-data'
import { getDepartmentInventory, getSupplies, createMovement, modifyDepartmentStock } from '@/lib/services'
import type { DepartmentInventory, Supply } from '@/lib/types'

type MovementType = 'entrada' | 'salida' | 'transferencia'

export default function NodeRegistrarMovimientoPage() {
  const [deptId, setDeptId] = useState(1)
  const [dept, setDept] = useState(departments[0])
  const [type, setType] = useState<MovementType>('entrada')
  const [supplyId, setSupplyId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [destDeptId, setDestDeptId] = useState('')
  const [observations, setObservations] = useState('')
  const [success, setSuccess] = useState(false)
  const [inventory, setInventory] = useState<DepartmentInventory[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])

  useEffect(() => {
    const storedDeptId = parseInt(sessionStorage.getItem('sghd_nodo_department') || '1', 10)
    setDeptId(storedDeptId)
    const found = departments.find(d => d.id === storedDeptId)
    if (found) setDept(found)

    Promise.all([getDepartmentInventory(), getSupplies()])
      .then(([inventoryData, suppliesData]) => {
        setInventory(inventoryData)
        setSupplies(suppliesData)
        
        if (inventoryData.length > 0) {
          const actualDeptId = inventoryData[0].department_id
          setDeptId(actualDeptId)
          const found = departments.find(d => d.id === actualDeptId)
          if (found) setDept(found)
        }
      })
      .catch((error) => {
        console.error('Error cargando datos de movimiento:', error)
      })
  }, [])

  const localInventory = inventory
  const selectedSupplyId = Number(supplyId)
  const requestedQuantity = Number(quantity)
  const selectedSupply = supplies.find((s) => s.id === selectedSupplyId)
  const selectedInventory = localInventory.find((inv) => inv.supply_id === selectedSupplyId)
  const lowStockWarning = (() => {
    if (type !== 'transferencia' || !selectedInventory || !selectedSupply || !Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      return null
    }

    const minimumStock = selectedInventory.minimum_stock || selectedSupply.minimum_stock
    const projectedStock = selectedInventory.quantity - requestedQuantity

    if (selectedInventory.quantity < minimumStock) {
      return {
        title: 'El departamento origen ya tiene bajo stock',
        message: `${selectedSupply.name} tiene ${selectedInventory.quantity} unidades en ${dept.name}, bajo el mínimo de ${minimumStock}. Después de transferir quedará con ${projectedStock} unidades.`,
      }
    }

    if (projectedStock < minimumStock) {
      return {
        title: 'Esta transferencia dejará bajo stock',
        message: `${selectedSupply.name} quedará con ${projectedStock} unidades en ${dept.name}, bajo el mínimo de ${minimumStock}.`,
      }
    }

    return null
  })()
  const availableSupplies = supplies.filter((s) => {
    if (!s.is_active) return false
    return type === 'entrada'
      ? true
      : localInventory.some(inv => inv.supply_id === s.id)
  })
  const otherDepartments = departments.filter(d => d.id !== deptId && d.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supplyIdNumber = Number(supplyId)
    const quantityNumber = Number(quantity)

    if (lowStockWarning) {
      const shouldContinue = window.confirm(`${lowStockWarning.title}\n\n${lowStockWarning.message}\n\n¿Deseas registrar la transferencia de todas formas?`)
      if (!shouldContinue) return
    }

    try {
      if (type === 'transferencia') {
        await createMovement({
          supply_id: supplyIdNumber,
          quantity: quantityNumber,
          source_department_id: deptId,
          destination_department_id: parseInt(destDeptId, 10),
          observations,
          user_id: 1,
        })
      } else {
        const quantityChange = type === 'entrada' ? quantityNumber : -quantityNumber
        await modifyDepartmentStock({
          supply_id: supplyIdNumber,
          quantity_change: quantityChange,
          observations,
          user_id: 1,
        })
      }

      const updatedInventory = await getDepartmentInventory()
      setInventory(updatedInventory)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setType('entrada')
        setSupplyId('')
        setQuantity('')
        setDestDeptId('')
        setObservations('')
      }, 2000)
    } catch (error) {
      console.error('Error registrando movimiento:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Movimiento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registrar entrada, salida o transferencia de insumos en {dept.name}
        </p>
      </div>

      <div className="max-w-xl">
        <div className="rounded-xl border border-border bg-card p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Movimiento Registrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                El movimiento ha sido registrado correctamente
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Movement Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Tipo de Movimiento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['entrada', 'salida', 'transferencia'] as MovementType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                        type === t
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supply */}
              <div>
                <label htmlFor="supply" className="mb-1.5 block text-sm font-medium text-foreground">
                  Insumo
                </label>
                <select
                  id="supply"
                  value={supplyId}
                  onChange={(e) => setSupplyId(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Seleccionar insumo</option>
                  {availableSupplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.internal_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-foreground">
                  Cantidad
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ingrese cantidad"
                />
              </div>

              {/* Destination Department (only for transfers) */}
              {type === 'transferencia' && (
                <div>
                  <label htmlFor="destDept" className="mb-1.5 block text-sm font-medium text-foreground">
                    Departamento Destino
                  </label>
                  <select
                    id="destDept"
                    value={destDeptId}
                    onChange={(e) => setDestDeptId(e.target.value)}
                    required
                    className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Seleccionar departamento</option>
                    {otherDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {lowStockWarning && (
                <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{lowStockWarning.title}</p>
                    <p>{lowStockWarning.message}</p>
                  </div>
                </div>
              )}

              {/* Observations */}
              <div>
                <label htmlFor="observations" className="mb-1.5 block text-sm font-medium text-foreground">
                  Observaciones (opcional)
                </label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Notas adicionales..."
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4" />
                Registrar Movimiento
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
