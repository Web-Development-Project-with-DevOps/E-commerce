from pymongo import MongoClient

MONGO_URI = "mongodb+srv://prath123:prath3132@mycluster1.ritxzre.mongodb.net/"

client = MongoClient(MONGO_URI)

db = client["ecommerce_db"]
