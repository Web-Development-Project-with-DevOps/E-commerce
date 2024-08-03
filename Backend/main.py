from fastapi import FastAPI, HTTPException
from models import Product
from crud import create_product, get_product
from schemas import ProductSchema
from typing import List


app = FastAPI()


@app.post("/products", response_model=ProductSchema)
def add_product(product: ProductSchema):
    product = Product(**product.dict())
    return create_product(product)


@app.get("/products/{product_id}", response_model=ProductSchema)
def read_product(product_id: str):
    product = get_product(product_id)
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Product not found")