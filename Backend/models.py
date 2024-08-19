from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Item(BaseModel):
    product_name: str
    price: float
    quantity: int
    subtotal: float

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserInDB(UserRegister):
    hashed_password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserInDB(BaseModel):
    username: str
    email: str
    hashed_password: str

class PublicUserDetails(BaseModel):
    userName: str
    email: str

class ShippingAddress(BaseModel):
    city: str
    country: str
    zip_code: str

class OrderCreate(BaseModel):
    user_id: str
    shipping_address: ShippingAddress

class Product(BaseModel):
    product_name: str
    price: float
    quantity: int
    description: Optional[str] = None
    image_url: Optional[str] = None