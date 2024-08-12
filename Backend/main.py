from fastapi import FastAPI, HTTPException, Cookie, Response, Depends
from fastapi.staticfiles import StaticFiles
from models import Product, Item, Order, UserRegister, LoginUser
from database import db
from bson import ObjectId
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_directory = os.path.join(os.path.dirname(__file__), "..", "Frontend")

# Check if the directory exists
if not os.path.isdir(frontend_directory):
    raise RuntimeError(f"Directory '{frontend_directory}' does not exist")

app.mount("/static", StaticFiles(directory=frontend_directory), name="static")

# Dependency to retrieve user_id from cookie
def get_user_id_from_cookie(user_id: str = Cookie(None)):
    if not user_id:
        raise HTTPException(status_code=401, detail="User not logged in")
    return user_id

@app.post("/register")
def register_user(user: UserRegister):
    try:
        if db['users'].find_one({"email": user.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        if db['users'].find_one({"userName": user.userName}):
            raise HTTPException(status_code=400, detail="Username already taken")

        user_data = {
            "userName": user.userName,
            "email": user.email,
            "password": user.password,  # Plaintext password (not recommended for production)
            "created_on": datetime.now()
        }
        result = db['users'].insert_one(user_data)

        return {"msg": "User registered successfully", "user_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")

@app.post("/login")
def login_user(request: LoginUser, response: Response):
    try:
        user_data = db['users'].find_one({"email": request.email})
        if not user_data or user_data['password'] != request.password:  # Plaintext password check
            raise HTTPException(status_code=400, detail="Invalid email or password")

        # Set cookie with user_id
        response.set_cookie(key="user_id", value=str(user_data['_id']), httponly=True)
        return {"message": "Login successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during login") from e

@app.post("/products")
def create_product(product: Product):
    try:
        product_dict = product.dict()
        result = db['products'].insert_one(product_dict)
        return {"product_id": str(result.inserted_id)}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")

@app.get("/products")
def list_products():
    try:
        products = db['products'].find()
        products_list = []
        for product in products:
            product['_id'] = str(product['_id'])  # Convert ObjectId to string
            products_list.append(product)
        return products_list
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
def add_to_cart(cart_item: Item, user_id: str = Depends(get_user_id_from_cookie)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            cart = {"user_id": user_id, "items": []}

        for item in cart["items"]:
            if item["product_id"] == cart_item.product_id:
                item["quantity"] += cart_item.quantity
                break
        else:
            cart_item_data = cart_item.dict()
            cart["items"].append(cart_item_data)

        db['carts'].update_one({"user_id": user_id}, {"$set": cart}, upsert=True)

        grand_total = sum(item["quantity"] * item["price"] for item in cart["items"])
        db['carts'].update_one({"user_id": user_id}, {"$set": {"grand_total": grand_total}})

        return {"message": f"Added product {cart_item.product_id} with quantity {cart_item.quantity} to cart",
                "grand_total": grand_total}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error adding to cart: {str(e)}")

@app.post("/cart/remove")
def remove_from_cart(cart_item: Item, user_id: str = Depends(get_user_id_from_cookie)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if cart:
            cart['items'] = [item for item in cart['items'] if item['product_id'] != cart_item.product_id]
            db['carts'].update_one({"user_id": user_id}, {"$set": cart})
            return {"message": f"Removed product {cart_item.product_id} from cart"}
        raise HTTPException(status_code=404, detail="Cart not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")

@app.get("/cart")
def get_cart(user_id: str = Depends(get_user_id_from_cookie)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if cart:
            cart['_id'] = str(cart['_id'])
            return cart
        raise HTTPException(status_code=404, detail="Cart not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cart: {str(e)}")

@app.post("/orders")
def create_order(order: Order, user_id: str = Depends(get_user_id_from_cookie)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        order_dict = {
            "user_id": user_id,
            "createdOn": datetime.now(),
            "total_amount": sum(item["quantity"] * item["price"] for item in cart["items"]),
            "user_details": order.user_details.dict(),
            "user_address": order.user_address.dict(),
            "items": cart["items"],
            "status": "Pending"
        }

        result = db['orders'].insert_one(order_dict)
        db['carts'].delete_one({"user_id": user_id})

        order_dict["_id"] = str(result.inserted_id)
        return order_dict
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@app.post("/orders/cancel")
def cancel_order(order_id: str, user_id: str = Depends(get_user_id_from_cookie)):
    try:
        order = db['orders'].find_one({"_id": ObjectId(order_id), "user_id": user_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found or does not belong to the user")

        result = db['orders'].update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "Cancelled"}}
        )
        if result.modified_count == 1:
            return {"message": "Order cancelled successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to cancel the order")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling order: {str(e)}")

@app.get("/orders")
def get_order(order_id: str, user_id: str = Depends(get_user_id_from_cookie)):
    try:
        order = db['orders'].find_one({"_id": ObjectId(order_id), "user_id": user_id})
        if order:
            order['_id'] = str(order['_id'])
            return order
        raise HTTPException(status_code=404, detail="Order not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving order: {str(e)}")

# Route to serve HTML files
@app.get("/{file_name}")
async def get_file(file_name: str):
    if file_name in ["index.html", "login.html", "register.html", "cart.html", "orders.html"]:
        file_path = os.path.join(frontend_directory, file_name)
        if os.path.isfile(file_path):
            return StaticFiles(directory=frontend_directory).app(scope={"type": "http", "path": f"/static/{file_name}"}, receive=None)
        raise HTTPException(status_code=404, detail="File not found")
    raise HTTPException(status_code=404, detail="File not found")
