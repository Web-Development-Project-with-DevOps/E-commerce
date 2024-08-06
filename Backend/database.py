import json
from pymongo import MongoClient

with open("config.json", "r") as config_file:
    config = json.load(config_file)

MONGO_URI = config['mongodb']['uri']

client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]
