from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.inventory import (
    SupplyItem, IngestionResponse, 
    StockModificationRequest, MovementRequest, OperationResponse
)
from app.services.inventory_service import InventoryService
import logging

router = APIRouter()

@router.post("/departments/{department_id}/stock", response_model=OperationResponse)
def modify_department_stock(
    department_id: int, 
    request: StockModificationRequest, 
    db: Session = Depends(get_db)
):
    """
    Modify the stock quantity of a specific department (add or remove).
    """
    service = InventoryService(db)
    movement = service.modify_stock(department_id, request)
    return OperationResponse(
        message="Stock modified successfully",
        status="success",
        movement_id=movement.id
    )


@router.post("/movements", response_model=OperationResponse)
def register_movement(request: MovementRequest, db: Session = Depends(get_db)):
    """
    Register a movement of supplies between two departments.
    """
    service = InventoryService(db)
    movement = service.register_movement(request)
    return OperationResponse(
        message="Movement registered successfully",
        status="success",
        movement_id=movement.id
    )
