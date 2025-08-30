import ssl
import sys
import platform
import socket
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

# Load environment variables
load_dotenv()

def print_system_info():
    print("=== System Information ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"SSL version: {ssl.OPENSSL_VERSION}")
    print(f"Certifi CA bundle location: {certifi.where()}")
    print()

def test_mongodb_atlas():
    print("=== Testing MongoDB Atlas Connection ===")
    
    mongo_uri = os.getenv("MONGO_URI")
    print(f"Connection string: {mongo_uri}")
    
    # Extract hostname for socket test
    hostname = "cluster0.opn1abd.mongodb.net"
    port = 27017
    
    print(f"\n1. Testing socket connection to {hostname}:{port}")
    try:
        sock = socket.create_connection((hostname, port), timeout=10)
        print(f"✅ Socket connection successful")
        sock.close()
    except Exception as e:
        print(f"❌ Socket connection failed: {e}")
        return
    
    print(f"\n2. Testing SSL socket connection")
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                print(f"✅ SSL socket connection successful")
                print(f"SSL version: {ssock.version()}")
                print(f"Cipher: {ssock.cipher()}")
    except Exception as e:
        print(f"❌ SSL socket connection failed: {e}")
    
    print(f"\n3. Testing MongoDB connection with different SSL contexts")
    
    # Test with default SSL context
    try:
        print("Trying with ca_certs from certifi...")
        client = MongoClient(
            mongo_uri, 
            serverSelectionTimeoutMS=10000,
            ca_certs=certifi.where()
        )
        db_names = client.list_database_names()
        print(f"✅ SUCCESS with certifi CA bundle!")
        print(f"Databases: {db_names}")
        client.close()
        return True
    except Exception as e:
        print(f"❌ Failed with certifi: {e}")
    
    # Test with different SSL settings
    ssl_configs = [
        {"name": "No SSL verification", "params": {"ssl": False}},
        {"name": "Custom SSL context", "params": {
            "ssl": True,
            "ssl_cert_reqs": ssl.CERT_NONE,
            "ssl_match_hostname": False,
            "ssl_ca_certs": None
        }}
    ]
    
    for config in ssl_configs:
        try:
            print(f"Trying {config['name']}...")
            # Create URI without mongodb+srv (which forces SSL)
            simple_uri = mongo_uri.replace("mongodb+srv://", "mongodb://")
            simple_uri = simple_uri.replace("cluster0.opn1abd.mongodb.net", "ac-7shudtw-shard-00-00.opn1abd.mongodb.net:27017")
            
            client = MongoClient(
                simple_uri,
                serverSelectionTimeoutMS=10000,
                **config["params"]
            )
            db_names = client.list_database_names()
            print(f"✅ SUCCESS with {config['name']}!")
            print(f"Databases: {db_names}")
            client.close()
            return True
        except Exception as e:
            print(f"❌ Failed with {config['name']}: {e}")
    
    return False

if __name__ == "__main__":
    print_system_info()
    success = test_mongodb_atlas()
    
    if not success:
        print("\n=== Troubleshooting Suggestions ===")
        print("1. Check if your IP address is whitelisted in MongoDB Atlas")
        print("2. Verify username and password are correct")
        print("3. Try connecting from a different network")
        print("4. Check if there's a corporate firewall blocking the connection")
        print("5. Consider using a VPN if behind corporate network")
        print("6. Try updating Python SSL certificates: pip install --upgrade certifi")
