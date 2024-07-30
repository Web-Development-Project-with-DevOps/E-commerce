from pymongo import MongoClient

client = MongoClient("mongodb+srv://prath123:prath3132@mycluster1.ritxzre.mongodb.net/")

db = client[customerdata]
