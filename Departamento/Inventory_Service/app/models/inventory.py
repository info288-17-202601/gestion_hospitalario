from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class SupplyCategory(Base):
    __tablename__ = "supply_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    supplies = relationship("Supply", back_populates="category")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    inventory = relationship("DepartmentInventory", back_populates="department")
    movements_origin = relationship("InventoryMovement", foreign_keys="[InventoryMovement.origin_department_id]", back_populates="origin_department")
    movements_destination = relationship("InventoryMovement", foreign_keys="[InventoryMovement.destination_department_id]", back_populates="destination_department")


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    internal_code = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    unit_of_measure = Column(String(50))
    minimum_stock = Column(Numeric(10, 2), nullable=False)
    category_id = Column(Integer, ForeignKey("supply_category.id"))
    is_active = Column(Boolean, default=True)

    category = relationship("SupplyCategory", back_populates="supplies")
    department_inventory = relationship("DepartmentInventory", back_populates="supply")
    movements = relationship("InventoryMovement", back_populates="supply")


class DepartmentInventory(Base):
    __tablename__ = "department_inventory"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    quantity = Column(Numeric(10, 2), nullable=False, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="inventory")
    supply = relationship("Supply", back_populates="department_inventory")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False) # e.g. "entrada", "salida", "transferencia"
    quantity = Column(Numeric(10, 2), nullable=False)
    movement_date = Column(DateTime, default=datetime.utcnow)
    observations = Column(Text)
    user_id = Column(Integer) # Intentionally skipping users table foreign key as requested
    supply_id = Column(Integer, ForeignKey("supplies.id"))
    origin_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    destination_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    supply = relationship("Supply", back_populates="movements")
    origin_department = relationship("Department", foreign_keys=[origin_department_id], back_populates="movements_origin")
    destination_department = relationship("Department", foreign_keys=[destination_department_id], back_populates="movements_destination")
