import pymongo
from pymongo import MongoClient
import ssl
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
print(f"Testing MongoDB connection with URI: {mongo_uri}")

# Test different connection configurations
configs_to_test = [
    {
        "name": "Default SSL",
        "uri": mongo_uri,
        "options": {}
    },
    {
        "name": "SSL with CERT_NONE",
        "uri": mongo_uri,
        "options": {
            "ssl": True,
            "ssl_cert_reqs": ssl.CERT_NONE
        }
    },
    {
        "name": "TLS with invalid certs allowed",
        "uri": mongo_uri + "&tls=true&tlsAllowInvalidCertificates=true",
        "options": {}
    },
    {
        "name": "TLS insecure",
        "uri": mongo_uri,
        "options": {
            "tls": True,
            "tlsAllowInvalidCertificates": True,
            "tlsInsecure": True
        }
    }
]

for config in configs_to_test:
    print(f"\n--- Testing {config['name']} ---")
    try:
        client = MongoClient(
            config["uri"], 
            serverSelectionTimeoutMS=10000,  # 10 second timeout
            **config["options"]
        )
        
        # Test connection
        db_names = client.list_database_names()
        print(f"✅ SUCCESS! Connected with {config['name']}")
        print(f"Available databases: {db_names}")
        
        # Test accessing the specific database
        db = client.solarwatch
        collections = db.list_collection_names()
        print(f"Collections in 'solarwatch' database: {collections}")
        
        client.close()
        break  # If successful, no need to try other configs
        
    except Exception as e:
        print(f"❌ FAILED with {config['name']}: {str(e)}")

print("\nConnection test completed.")
