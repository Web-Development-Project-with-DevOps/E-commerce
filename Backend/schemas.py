from pydantic import BaseModel
from typing import Optional


class ProductSchema(BaseModel):
    name: str
    price: float
    quantity: int
    description: Optional[str] = None


class UserAddressSchema(BaseModel):
    city: str
    country: str
    zip_code: str

