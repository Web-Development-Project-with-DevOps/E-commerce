from pydantic import BaseModel
from typing import Optional


class Product(BaseModel):
    name: str
    price: float
    quantity: int
    description: Optional[str] = None


class UserAddress(BaseModel):
    city: str
    country: str
    zip_code: str





