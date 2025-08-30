from flask import Flask, request, jsonify, session
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import json
from bson import ObjectId
import threading
import time

from solar_simulator import SolarSimulator
from solar_predictor import SolarPredictor
from models import Building, SolarReading, Alert

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback_secret_key")

# MongoDB configuration (from .env)
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("❌ MONGO_URI is missing in .env file")

print(f"Connecting to MongoDB... URI: {mongo_uri}")

try:
    # Configure MongoDB
    app.config["MONGO_URI"] = mongo_uri
    mongo = PyMongo(app)
    
    # Explicitly test the connection by accessing the database
    db_names = mongo.cx.list_database_names()
    print(f"✅ Connected to MongoDB! Available databases: {db_names}")
    
    # Ensure the 'users' collection exists
    if 'users' not in mongo.db.list_collection_names():
        mongo.db.create_collection('users')
        print("Created 'users' collection")
        
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {str(e)}")
    print("Please check your MongoDB URI and make sure:")
    print("1. Username and password are correct")
    print("2. IP address is whitelisted in MongoDB Atlas")
    print("3. Database name is included in the URI")
    print("4. Network connection is stable")
    raise

# Initialize components
simulator = SolarSimulator()
predictor = SolarPredictor()
simulation_thread = None
is_simulating = False

# Enable CORS with specific settings
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:5173",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Root route
@app.route("/")
def index():
    return jsonify({"message": "SolarWatch API is running"}), 200

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, ObjectId)):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

def simulate_readings():
    """Background task to simulate readings"""
    global is_simulating
    while is_simulating:
        try:
            buildings = mongo.db.buildings.find()
            for building in buildings:
                reading = simulator.simulate_building_output(
                    building_id=str(building['_id']),
                    panel_area=building['panel_area']
                )
                
                # Save reading
                mongo.db.readings.insert_one(reading)
                
                # Check for alerts
                if predictor.is_trained:
                    prediction = predictor.predict(reading)
                    if predictor.check_alert_condition(reading['actual_output'], prediction):
                        alert = Alert(
                            building_id=reading['building_id'],
                            timestamp=datetime.fromisoformat(reading['timestamp']),
                            actual_output=reading['actual_output'],
                            expected_output=prediction,
                            deviation_percentage=predictor.calculate_deviation(
                                reading['actual_output'], 
                                prediction
                            )['percentage_deviation']
                        )
                        mongo.db.alerts.insert_one(alert.to_dict())
                
        except Exception as e:
            print(f"Error in simulation: {e}")
        
        time.sleep(300)  # Wait 5 minutes between readings

# ---------------- Authentication Routes ----------------

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = mongo.db.users.find_one({"username": username, "password": password})

    if user:
        session["username"] = username
        return jsonify({"message": "Login successful", "username": username}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route("/api/logout")
def logout():
    session.pop("username", None)
    return jsonify({"message": "Logout successful"}), 200

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    existing_user = mongo.db.users.find_one({"username": username})
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409

    mongo.db.users.insert_one({"username": username, "password": password})
    return jsonify({"message": "Registration successful"}), 201

# ---------------- Building Management ----------------

@app.route("/api/buildings", methods=["GET", "POST"])
def manage_buildings():
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    if request.method == "POST":
        data = request.get_json()
        building = Building(
            building_id=str(ObjectId()),
            name=data["name"],
            location=data["location"],
            panel_area=data["panel_area"],
            installation_date=datetime.fromisoformat(data["installation_date"])
        )
        mongo.db.buildings.insert_one(building.to_dict())
        return jsonify({"message": "Building added successfully"}), 201

    buildings = list(mongo.db.buildings.find())
    return jsonify([{**b, '_id': str(b['_id'])} for b in buildings])

# ---------------- Data Routes ----------------

@app.route("/api/readings/latest")
def get_latest_readings():
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    pipeline = [
        {
            "$sort": {"timestamp": -1}
        },
        {
            "$group": {
                "_id": "$building_id",
                "latest_reading": {"$first": "$$ROOT"}
            }
        }
    ]
    
    latest_readings = []
    buildings_data = list(mongo.db.readings.aggregate(pipeline))
    
    for reading_data in buildings_data:
        reading = reading_data["latest_reading"]
        building_id = reading["building_id"]
        
        # Get building data
        building_data = mongo.db.buildings.find_one({"_id": ObjectId(building_id)})
        if building_data:
            building = Building(
                building_id=str(building_data["_id"]),
                name=building_data["name"],
                location=building_data["location"],
                panel_area=building_data["panel_area"],
                installation_date=datetime.fromisoformat(building_data["installation_date"])
            )
            
            # Get weather data and predict output
            weather_data = building.get_weather_data()
            if weather_data:
                predicted_output = building.predict_solar_output(weather_data)
                reading["predicted_output"] = predicted_output
                reading["weather_condition"] = weather_data["weather"][0]["main"]
                reading["temperature"] = weather_data["main"]["temp"]
            
        latest_readings.append(reading)
    
    return jsonify(latest_readings)

@app.route("/api/readings/<building_id>")
def get_building_readings(building_id):
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = {"building_id": building_id}
    if start_date and end_date:
        query["timestamp"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    readings = list(mongo.db.readings.find(query).sort("timestamp", -1).limit(1000))
    return jsonify([{**r, '_id': str(r['_id'])} for r in readings])

@app.route("/api/alerts")
def get_alerts():
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    alerts = list(mongo.db.alerts.find({"status": "active"}).sort("timestamp", -1))
    return jsonify([{**a, '_id': str(a['_id'])} for a in alerts])

# ---------------- Simulation Control ----------------

@app.route("/api/simulation/start", methods=["POST"])
def start_simulation():
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    global simulation_thread, is_simulating
    
    if not is_simulating:
        is_simulating = True
        simulation_thread = threading.Thread(target=simulate_readings)
        simulation_thread.start()
        return jsonify({"message": "Simulation started"}), 200
    
    return jsonify({"message": "Simulation already running"}), 400

@app.route("/api/simulation/stop", methods=["POST"])
def stop_simulation():
    if "username" not in session:
        return jsonify({"message": "Unauthorized"}), 401

    global is_simulating
    
    if is_simulating:
        is_simulating = False
        return jsonify({"message": "Simulation stopped"}), 200
    
    return jsonify({"message": "Simulation not running"}), 400

if __name__ == "__main__":
    app.run(debug=True)
