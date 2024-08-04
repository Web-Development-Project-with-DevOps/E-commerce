from fastapi import APIRouter, HTTPException
from models import Product, CartItem, Order, UserRegister
from schemas import ProductSchema, OrderSchema, CartItemSchema
from database import db
from bson import ObjectId
from bson.json_util import dumps
from datetime import datetime

router = APIRouter()


@router.post("/products", response_model=ProductSchema)
def create_product(product: ProductSchema):
    product_dict = product.dict()
    result = db['products'].insert_one(product_dict)
    return {"product_id": str(result.inserted_id)}


@router.get("/products", response_model=ProductSchema)
def list_products():
    products = db['products'].find()
    return dumps(products)


@router.get("/products/{product_id}", response_model=ProductSchema)
def get_product(product_id: str):
    product = db['products'].find_one({"_id": ObjectId(product_id)})
    if product:
        product['_id'] = str(product['_id'])
        return product
    raise HTTPException(status_code=404, detail="Product not found")


@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: str, product: Product):
    updated_product = db['products'].find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": product.dict()},
        return_document=True
    )
    if updated_product:
        updated_product['_id'] = str(updated_product['_id'])
        return updated_product
    raise HTTPException(status_code=404, detail="Product not found")


@router.delete("/products/{product_id}", response_model=ProductSchema)
def delete_product(product_id: str):
    result = db['products'].delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count:
        return {"message": "Product deleted"}
    raise HTTPException(status_code=404, detail="Product not found")


@router.post("/cart/add")
def add_to_cart(cart_item: CartItem):
    # Find the cart or create a new one if it doesn't exist
    cart = db['carts'].find_one({"user_id": cart_item.user_id})
    if not cart:
        cart = {"user_id": cart_item.user_id, "items": []}
    # Add or update the product in the cart
    for item in cart["items"]:
        item = item.dict()
        if item["product_id"] == cart_item.product_id:
            item["quantity"] += cart_item.quantity
            break
    else:
        cart["items"].append(cart_item.dict())
    db['carts'].update_one({"user_id": cart_item.user_id}, {"$set": cart}, upsert=True)
    return {"message": f"Added product {cart_item.product_id} with quantity {cart_item.quantity} to cart"}


@router.post("/cart/remove")
def remove_from_cart(user_id: str, product_id: str):
    cart = db['carts'].find_one({"user_id": user_id})
    if cart:
        cart['items'] = [item for item in cart['items'] if item['product_id'] != product_id]
        db['carts'].update_one({"user_id": user_id}, {"$set": cart})
        return {"message": f"Removed product {product_id} from cart"}
    raise HTTPException(status_code=404, detail="Cart not found")


@router.get("/cart/{user_id}")
def get_cart(user_id: str):
    cart = db['carts'].find_one({"user_id": user_id})
    if cart:
        cart['_id'] = str(cart['_id'])
        return cart
    raise HTTPException(status_code=404, detail="Cart not found")


@router.post("/orders", response_model=OrderSchema)
def create_order(order: OrderSchema):
    order_dict = order.dict()
    result = db['orders'].insert_one(order_dict)
    return {"message": "Order created successfully", "order_id": str(result.inserted_id)}


@router.put("/orders/{order_id}/status", response_model=OrderSchema)
def update_order_status(order_id: str, status: str):
    updated_order = db['orders'].find_one_and_update(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status}},
        return_document=True
    )
    if updated_order:
        updated_order['_id'] = str(updated_order['_id'])
        return {"message": f"Order {order_id} status updated to {status}"}
    raise HTTPException(status_code=404, detail="Order not found")


@router.get("/orders/{order_id}", response_model=OrderSchema)
def get_order(order_id: str):
    order = db['orders'].find_one({"_id": ObjectId(order_id)})
    if order:
        order['_id'] = str(order['_id'])
        return order
    raise HTTPException(status_code=404, detail="Order not found")


@router.post("/register")
def register_user(user: UserRegister):
    # Check if the user already exists
    if db['users'].find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if db['users'].find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    user_data = {
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "created_on": datetime.now()
    }
    db['users'].insert_one(user_data)

    return {"msg": "User registered successfully"}