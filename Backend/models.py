from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Item(BaseModel):
    productId: str
    boughtQuantity: int


class UserRegister(BaseModel):
    userName: str
    email: str
    password: str


class PublicUserDetails(BaseModel):
    userName: str
    email: str


class UserAddress(BaseModel):
    city: str
    country: str
    zip_code: str


class Order(BaseModel):
    createdOn: datetime = Field(default_factory=datetime.now)
    total_amount: float
    user_name: PublicUserDetails
    user_address: UserAddress
    items: List[Item]
    status: str


class Product(BaseModel):
    name: str
    price: float
    quantity: int
    description: Optional[str] = None


class CartItem(BaseModel):
    user_id: str
    product_id: str
    quantity: int
