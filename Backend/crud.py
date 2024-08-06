from database import db
from models import Product, Order, UserRegister
from bson import ObjectId
from pymongo.errors import PyMongoError


def verify_user(user_id: str) -> dict:
    try:
        return db["users"].find_one({"_id": ObjectId(user_id)})
    except PyMongoError as e:
        raise ValueError(f"Error verifying user: {str(e)}")


def create_user(userdata: UserRegister) -> dict:
    try:
        user_dict = userdata.dict()
        result = db["users"].insert_one(user_dict)
        return db["users"].find_one({"_id": result.inserted_id})
    except PyMongoError as e:
        raise ValueError(f"Error creating user: {str(e)}")


def get_product(product_id: str) -> dict:
    try:
        return db['products'].find_one({"_id": ObjectId(product_id)})
    except PyMongoError as e:
        raise ValueError(f"Error retrieving product: {str(e)}")


def create_product(product: Product) -> dict:
    try:
        product_dict = product.dict()
        result = db['products'].insert_one(product_dict)
        return db['products'].find_one({"_id": result.inserted_id})
    except PyMongoError as e:
        raise ValueError(f"Error creating product: {str(e)}")


def add_to_cart(user_id: str, product_id: str, quantity: int) -> dict:
    try:
        user = verify_user(user_id)
        if not user:
            raise ValueError("User not found")

        cart = db['carts'].find_one({"user_id": user_id})
        if not cart:
            cart = {"user_id": user_id, "items": []}

        for item in cart["items"]:
            if item["product_id"] == product_id:
                item["quantity"] += quantity
                break
        else:
            cart["items"].append({"product_id": product_id, "quantity": quantity})

        db['carts'].update_one({"user_id": user_id}, {"$set": cart}, upsert=True)
        return cart
    except PyMongoError as e:
        raise ValueError(f"Error adding to cart: {str(e)}")


def create_order(order: Order) -> dict:
    try:
        order_dict = order.dict()
        result = db['orders'].insert_one(order_dict)
        return db['orders'].find_one({"_id": result.inserted_id})
    except PyMongoError as e:
        raise ValueError(f"Error creating order: {str(e)}")


def get_order(order_id: str) -> dict:
    try:
        return db['orders'].find_one({"_id": ObjectId(order_id)})
    except PyMongoError as e:
        raise ValueError(f"Error retrieving order: {str(e)}")
