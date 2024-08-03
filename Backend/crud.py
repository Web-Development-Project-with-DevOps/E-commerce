from database import db
from models import Product
from bson import ObjectId


def get_product(product_id: str) -> dict:
    return db['products'].find_one({"_id": ObjectId(product_id)})


def create_product(product: Product) -> dict:
    product_dict = product.dict()
    result = db['products'].insert_one(product_dict)
    return db['products'].find_one({"_id": result.inserted_id})

