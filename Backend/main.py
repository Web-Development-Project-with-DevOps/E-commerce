from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from models import Product, Item, OrderCreate, UserRegister, UserLogin, UserInDB
from database import db
from bson import ObjectId
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError
import os
from passlib.context import CryptContext

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def serialize_document(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc


@app.get("/")
async def redirect_to_index():
    return RedirectResponse(url="/static/index.html")


@app.post("/register")
def register_user(user: UserRegister):
    existing_user = db['users'].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    user_in_db = UserInDB(**user.dict(), hashed_password=hashed_password)
    result = db['users'].insert_one(user_in_db.dict(exclude={"password"}))

    if result.inserted_id:
        return {"message": "User registered successfully"}
    else:
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/login")
def login_user(user: UserLogin):
    user_in_db = db['users'].find_one({"email": user.email})
    if not user_in_db:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not pwd_context.verify(user.password, user_in_db['hashed_password']):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": str(user_in_db["_id"])}


@app.post("/product")
def create_product(product: Product):
    try:
        product_dict = product.dict()
        result = db['products'].insert_one(product_dict)
        return {"product_name": product.product_name}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")


@app.get("/products")
def list_products():
    try:
        products = db['products'].find()
        products_list = []
        for product in products:
            product['_id'] = str(product['_id'])
            products_list.append(product)
        return products_list
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error listing products: {str(e)}")


@app.get("/products/name/{product_name}", response_model=Product)
def get_product(product_name: str):
    try:
        product = db['products'].find_one({"product_name": product_name})
        if product:
            product['product_name'] = product['product_name']
            return product
        raise HTTPException(status_code=404, detail="Product not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving product: {str(e)}")


@app.post("/cart/add")
def add_to_cart(cart_item: Item, user_id: str = Query(...)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            cart = {"user_id": user_id, "items": []}

        for item in cart["items"]:
            if item["product_name"] == cart_item.product_name:
                item["quantity"] += cart_item.quantity
                item["subtotal"] = item["quantity"] * cart_item.price
                break
        else:
            cart_item.subtotal = cart_item.quantity * cart_item.price
            cart["items"].append(cart_item.dict())

        cart["grand_total"] = sum(item["subtotal"] for item in cart["items"])

        db['carts'].update_one({"user_id": user_id}, {"$set": cart}, upsert=True)

        return {"message": "Item added to cart successfully", "grand_total": cart["grand_total"]}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error adding to cart: {str(e)}")


@app.post("/cart/remove")
def remove_from_cart(product_name: str = Query(...), user_id: str = Query(...)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        cart['items'] = [item for item in cart['items'] if item['product_name'] != product_name]

        cart["grand_total"] = sum(item["subtotal"] for item in cart["items"])

        db['carts'].update_one({"user_id": user_id}, {"$set": cart})

        return {"message": "Item removed from cart successfully", "grand_total": cart["grand_total"]}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")


@app.post("/cart/update")
def update_cart_item(item: Item, user_id: str = Query(...)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        item_found = False

        for cart_item in cart.get("items", []):
            if cart_item["product_name"] == item.product_name:
                cart_item["quantity"] = item.quantity
                cart_item["subtotal"] = item.quantity * item.price
                item_found = True
                break

        if not item_found:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        cart["grand_total"] = sum(cart_item["subtotal"] for cart_item in cart["items"])

        db['carts'].update_one({"user_id": user_id},
                               {"$set": {"items": cart["items"], "grand_total": cart["grand_total"]}})

        return {"message": "Cart updated successfully", "grand_total": cart["grand_total"]}
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error updating cart: {str(e)}")


@app.get("/cart")
def get_cart(user_id: str = Query(...)):
    try:
        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        cart = serialize_document(cart)
        return cart
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving cart: {str(e)}")


@app.post("/checkout")
async def create_order(order: OrderCreate):
    try:
        cart = db['carts'].find_one({"user_id": order.user_id})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        order_dict = {
            "user_id": order.user_id,
            "createdOn": datetime.now(),
            "total_amount": sum(item["quantity"] * item["price"] for item in cart["items"]),
            "shipping_address": order.shipping_address.dict(),
            "items": cart["items"],
            "status": "Pending"
        }

        result = db['orders'].insert_one(order_dict)
        db['carts'].delete_one({"user_id": order.user_id})

        order_dict["_id"] = str(result.inserted_id)
        return order_dict
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


# @app.post("/orders/cancel")
# def cancel_order(order_id: str, user_id: str = Query(...)):
#     try:
#         order = db['orders'].find_one({"_id": ObjectId(order_id), "user_id": user_id})
#         if not order:
#             raise HTTPException(status_code=404, detail="Order not found or does not belong to the user")
#
#         result = db['orders'].update_one(
#             {"_id": ObjectId(order_id)},
#             {"$set": {"status": "Cancelled"}}
#         )
#         if result.modified_count == 1:
#             return {"message": "Order cancelled successfully"}
#         else:
#             raise HTTPException(status_code=500, detail="Failed to cancel the order")
#     except PyMongoError as e:
#         raise HTTPException(status_code=500, detail=f"Error cancelling order: {str(e)}")

@app.get("/orders")
def get_all_orders(user_id: str = Query(...)):
    try:
        orders = db['orders'].find({"user_id": user_id})
        orders_list = []
        for order in orders:
            order['_id'] = str(order['_id'])
            orders_list.append(order)
        return orders_list
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving orders: {str(e)}")


@app.delete("/cart/delete")
def delete_cart(user_id: str = Query(...)):
    try:
        result = db['carts'].delete_one({"user_id": user_id})
        if result.deleted_count == 1:
            return {"message": "Cart deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Cart not found")
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Error deleting cart: {str(e)}")


@app.get("/{file_name}")
async def get_file(file_name: str):
    if file_name in ["index.html", "login.html", "register.html", "cart.html", "orders.html", "checkout.html"]:
        file_path = os.path.join(frontend_directory, file_name)
        if os.path.isfile(file_path):
            return StaticFiles(directory=frontend_directory).app(scope={"type": "http", "path": f"/static/{file_name}"},
                                                                 receive=None)
        raise HTTPException(status_code=404, detail="File not found")
    raise HTTPException(status_code=404, detail="File not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)