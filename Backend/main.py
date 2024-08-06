from fastapi import FastAPI, HTTPException
from models import Product, CartItem, Order, UserRegister
from database import db
from bson import ObjectId
from bson.json_util import dumps
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register")
def register_user(user: UserRegister):
    try:
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
        result = db['users'].insert_one(user_data)

        return {"msg": "User registered successfully", "user_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")


@app.post("/login")
def login_user(user: UserRegister):
    try:
        # Find the user in the database by email
        user_data = db['users'].find_one({"email": user.email})
        if user_data and user_data['password'] == user.password:
            return {"message": "Login successful", "user_id": str(user_data['_id'])}
        else:
            raise HTTPException(status_code=400, detail="Invalid email or password")

    except HTTPException as e:
        raise e  # Reraise the same HTTPException
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail="An error occurred during login") from e


@app.get("/products")
def list_products():
    try:
        products = db['products'].find()
        return dumps(products)
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error listing products: {str(e)}")


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    try:
        product = db['products'].find_one({"_id": ObjectId(product_id)})
        if product:
            product['_id'] = str(product['_id'])
            return product
        raise HTTPException(status_code=404, detail="Product not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving product: {str(e)}")


@app.post("/cart/add")
def add_to_cart(cart_item: CartItem):
    try:
        # Find the cart or create a new one if it doesn't exist
        cart = db['carts'].find_one({"user_id": cart_item.user_id})
        if not cart:
            cart = {"user_id": cart_item.user_id, "items": []}
        # Add or update the product in the cart
        for item in cart["items"]:
            if item["product_id"] == cart_item.product_id:
                item["quantity"] += cart_item.quantity
                break
        else:
            cart["items"].append(cart_item.dict())
        db['carts'].update_one({"user_id": cart_item.user_id}, {"$set": cart}, upsert=True)
        return {"message": f"Added product {cart_item.product_id} with quantity {cart_item.quantity} to cart"}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error adding to cart: {str(e)}")


@app.post("/cart/remove")
def remove_from_cart(cart_item: CartItem):
    try:
        cart = db['carts'].find_one({"user_id": cart_item.user_id})
        if cart:
            cart['items'] = [item for item in cart['items'] if item['product_id'] != cart_item.product_id]
            db['carts'].update_one({"user_id": cart_item.user_id}, {"$set": cart})
            return {"message": f"Removed product {cart_item.product_id} from cart"}
        raise HTTPException(status_code=404, detail="Cart not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")


@app.get("/cart/{user_id}")
def get_cart(user_id: str):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if cart:
            cart['_id'] = str(cart['_id'])
            return cart
        raise HTTPException(status_code=404, detail="Cart not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cart: {str(e)}")


@app.post("/orders", response_model=Order)
def create_order(order: Order):
    try:
        order_dict = order.dict()
        result = db['orders'].insert_one(order_dict)
        return {"message": "Order created successfully", "order_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@app.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: str):
    try:
        order = db['orders'].find_one({"_id": ObjectId(order_id)})
        if order:
            order['_id'] = str(order['_id'])
            return order
        raise HTTPException(status_code=404, detail="Order not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving order: {str(e)}")
