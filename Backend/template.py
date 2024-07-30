from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pymongo import MongoClient

app = FastAPI()

# app.mount("/static", StaticFiles(directory="static"), name="static")
client = MongoClient("mongodb+srv://prath123:prath3132@mycluster1.ritxzre.mongodb.net")



# db = conn.get_database("items")
# student_collection = db.get_collection("items")
db = client['items']
print(list(db.items.find({})))

templates = Jinja2Templates(directory="templates")

@app.get("/items/{id}", response_class=HTMLResponse)
async def read_item(request: Request, id: str):
    return templates.TemplateResponse(
        request=request, name="item.html", context={"id": id}
    )