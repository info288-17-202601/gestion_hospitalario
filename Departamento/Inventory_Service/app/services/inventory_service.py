from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.inventory import DepartmentInventory, InventoryMovement, Supply, Department
from app.schemas.inventory import StockModificationRequest, MovementRequest, SupplyItem
import logging

class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def process_ingestion(self, item: SupplyItem):
        # Legacy ingestion wrapper, for now just logging it
        logging.info(f"Processing legacy ingestion for item {item.id}")
        return True

    def modify_stock(self, department_id: int, request: StockModificationRequest):
        # Check if department exists
        department = self.db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

        # Check if supply exists
        supply = self.db.query(Supply).filter(Supply.id == request.supply_id).first()
        if not supply:
            raise HTTPException(status_code=404, detail="Supply not found")

        # Get or create inventory record
        inventory = self.db.query(DepartmentInventory).filter(
            DepartmentInventory.department_id == department_id,
            DepartmentInventory.supply_id == request.supply_id
        ).first()

        if not inventory:
            inventory = DepartmentInventory(
                department_id=department_id,
                supply_id=request.supply_id,
                quantity=0
            )
            self.db.add(inventory)

        new_quantity = float(inventory.quantity) + request.quantity_change
        if new_quantity < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock for this operation")

        inventory.quantity = new_quantity

        # Register movement
        movement_type = "entrada" if request.quantity_change > 0 else "salida"
        movement = InventoryMovement(
            type=movement_type,
            quantity=abs(request.quantity_change),
            observations=request.observations,
            user_id=request.user_id,
            supply_id=request.supply_id,
            origin_department_id=department_id if request.quantity_change < 0 else None,
            destination_department_id=department_id if request.quantity_change > 0 else None
        )
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)

        return movement

    def register_movement(self, request: MovementRequest):
        # Validation
        if request.origin_department_id == request.destination_department_id:
            raise HTTPException(status_code=400, detail="Origin and destination must be different")

        # Fetch origin inventory
        origin_inv = self.db.query(DepartmentInventory).filter(
            DepartmentInventory.department_id == request.origin_department_id,
            DepartmentInventory.supply_id == request.supply_id
        ).first()

        if not origin_inv or float(origin_inv.quantity) < request.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock in origin department")

        # Fetch or create destination inventory
        dest_inv = self.db.query(DepartmentInventory).filter(
            DepartmentInventory.department_id == request.destination_department_id,
            DepartmentInventory.supply_id == request.supply_id
        ).first()

        if not dest_inv:
            dest_inv = DepartmentInventory(
                department_id=request.destination_department_id,
                supply_id=request.supply_id,
                quantity=0
            )
            self.db.add(dest_inv)

        # Apply changes
        origin_inv.quantity = float(origin_inv.quantity) - request.quantity
        dest_inv.quantity = float(dest_inv.quantity) + request.quantity

        # Record the transfer
        movement = InventoryMovement(
            type="transferencia",
            quantity=request.quantity,
            observations=request.observations,
            user_id=request.user_id,
            supply_id=request.supply_id,
            origin_department_id=request.origin_department_id,
            destination_department_id=request.destination_department_id
        )
        self.db.add(movement)
        self.db.commit()
        self.db.refresh(movement)

        return movement
