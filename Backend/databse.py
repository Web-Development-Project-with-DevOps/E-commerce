from pymongo import MongoClient

client = MongoClient("mongodb+srv://username:password@mycluster1.ritxzre.mongodb.net/")

db = client[customerdata]
