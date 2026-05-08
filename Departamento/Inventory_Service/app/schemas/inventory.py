from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SupplyItem(BaseModel):
    """
    Model representing an inventory supply item (Legacy ingestion endpoint format).
    """
    id: str = Field(..., description="Unique identifier for the supply item")
    name: str = Field(..., description="Name of the supply item (e.g., 'Syringes', 'Bandages')")
    category: str = Field(..., description="Category of the supply")
    quantity: int = Field(..., ge=0, description="Current quantity in stock")
    threshold: int = Field(default=10, description="Minimum quantity threshold before alerting")
    department_id: str = Field(..., description="ID of the department holding this inventory")
    last_updated: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Last update timestamp")

class IngestionResponse(BaseModel):
    """
    Model for the response of the legacy ingestion endpoint.
    """
    message: str
    item_id: str
    status: str

class StockModificationRequest(BaseModel):
    """
    Model for modifying stock quantity in a department.
    """
    supply_id: int
    quantity_change: float = Field(..., description="Positive for addition, negative for subtraction")
    observations: Optional[str] = None
    user_id: int = Field(..., description="User performing the modification")

class MovementRequest(BaseModel):
    """
    Model for registering a movement between departments.
    """
    supply_id: int
    quantity: float = Field(..., gt=0, description="Quantity to move")
    origin_department_id: int
    destination_department_id: int
    observations: Optional[str] = None
    user_id: int = Field(..., description="User performing the movement")

class OperationResponse(BaseModel):
    """
    Generic response model for operations like stock modifications and movements.
    """
    message: str
    status: str
    movement_id: Optional[int] = None
