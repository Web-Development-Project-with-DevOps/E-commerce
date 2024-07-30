from fastapi import FastAPI
import connection
from bson import ObjectId
from schematics.models import Model


class Customer(Model):
    cust_id= ObjectId()
    cust_email = EmailType(required=True)
    cust_name = StringType(required=True)

# An instance of class User
newuser = Customer()

# funtion to create and assign values to the instanse of class Customer created
def create_user(email, username):
    newuser.cust_id = ObjectId()
    newuser.cust_email  = email
    newuser.cust_name = username
    return dict(newuser)

app = FastAPI()


# Our root endpoint
@app.get("/")
def index():
    return {"message": "Welcome to FastAPI World"}

# Signup endpoint with the POST method
@app.post("/signup/{email}/{username}")
def addUser(email, username: str):
    user_exists = False
    data = create_user(email, username)

    # Covert data to dict so it can be easily inserted to MongoDB
    dict(data)

    # Checks if an email exists from the collection of users
    if connection.db.users.find(
        {'email': data['email']}
        ).count() > 0:
        user_exists = True
        print("Customer Exists")
        return {"message":"Customer Exists"}
    # If the email doesn't exist, create the user
    elif user_exists == False:
        connection.db.users.insert_one(data)
        return {"message":"User Created","email": data['email'], "name": data['name']}