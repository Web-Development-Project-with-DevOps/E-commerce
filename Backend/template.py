from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

# app.mount("/static", StaticFiles(directory="static"), name="static")
client = MongoClient("mongodb+srv://username:password@mycluster1.ritxzre.mongodb.net")

# db = conn.get_database("items")
# student_collection = db.get_collection("items")
db = client.product_db
collection = db.products
print(list(db.items.find({})))

templates = Jinja2Templates(directory="templates")

class Product(BaseModel):
    name: str
    quantity: int
    price: float

@app.get("/item/{id}", response_class=HTMLResponse)
async def read_item(request: Request, id: str):
    return templates.TemplateResponse(
        request=request, name="item.html", context={"id": id}
    )

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse(
        {"request": request}, "products.html"
    )

@app.post("/submit")
async def submit_form(name: str = Form(...), quantity: int = Form(...), price = Form(...)):
    product = {"name": name, "quantity": quantity, "price": price}
    collection.insert_one(product)
    return RedirectResponse(url="/")
