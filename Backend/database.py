import json
from pymongo import MongoClient, errors

try:
    # Load the configuration file
    with open("config.json", "r") as config_file:
        config = json.load(config_file)

    # Retrieve MongoDB URI from config
    MONGO_URI = config['mongodb']['uri']

    # Try to create a MongoDB client and connect to the database
    client = MongoClient(MONGO_URI)
    db = client["ecommerce_db"]

except FileNotFoundError:
    print("Error: The config.json file was not found.")
except json.JSONDecodeError as e:
    print(f"Error: Failed to decode JSON from config file. Details: {str(e)}")
except KeyError:
    print("Error: 'uri' key not found in config['mongodb'].")
except errors.ConfigurationError as e:
    print(f"Error: MongoDB configuration error. Details: {str(e)}")
except errors.ConnectionError as e:
    print(f"Error: Failed to connect to MongoDB. Details: {str(e)}")
except Exception as e:
    print(f"An unexpected error occurred. Details: {str(e)}")
