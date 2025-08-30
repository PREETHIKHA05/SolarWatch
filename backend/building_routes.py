from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from .config import MONGO_URI
from .models import Building, SolarReading, Alert

building_bp = Blueprint('building', __name__)
client = MongoClient(MONGO_URI)
db = client.solarwatch

@building_bp.route('/api/buildings', methods=['GET'])
@login_required
def get_buildings():
    buildings = db.buildings.find({'user_id': current_user.username})
    return jsonify([{
        'id': str(b['_id']),
        'name': b['name'],
        'location': b['location'],
        'panel_area': b['panel_area'],
        'installation_date': b['installation_date']
    } for b in buildings]), 200

@building_bp.route('/api/buildings', methods=['POST'])
@login_required
def add_building():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'location', 'panel_area']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    building = {
        'name': data['name'],
        'location': data['location'],
        'panel_area': float(data['panel_area']),
        'installation_date': datetime.utcnow().isoformat(),
        'user_id': current_user.username
    }
    
    result = db.buildings.insert_one(building)
    building['_id'] = str(result.inserted_id)
    
    return jsonify({
        'message': 'Building added successfully',
        'building': building
    }), 201

@building_bp.route('/api/buildings/<building_id>/readings', methods=['GET'])
@login_required
def get_building_readings(building_id):
    building = db.buildings.find_one({
        '_id': ObjectId(building_id),
        'user_id': current_user.username
    })
    
    if not building:
        return jsonify({'message': 'Building not found'}), 404
    
    readings = db.solar_readings.find({'building_id': building_id})
    return jsonify([{
        'timestamp': r['timestamp'],
        'actual_output': r['actual_output'],
        'expected_output': r['expected_output'],
        'weather': r['weather']
    } for r in readings]), 200

@building_bp.route('/api/buildings/<building_id>/alerts', methods=['GET'])
@login_required
def get_building_alerts(building_id):
    building = db.buildings.find_one({
        '_id': ObjectId(building_id),
        'user_id': current_user.username
    })
    
    if not building:
        return jsonify({'message': 'Building not found'}), 404
    
    alerts = db.alerts.find({
        'building_id': building_id,
        'status': 'active'
    })
    
    return jsonify([{
        'timestamp': a['timestamp'],
        'actual_output': a['actual_output'],
        'expected_output': a['expected_output'],
        'deviation_percentage': a['deviation_percentage'],
        'status': a['status']
    } for a in alerts]), 200
