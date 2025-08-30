from datetime import datetime
from typing import Dict, List
import requests
import os
from dotenv import load_dotenv

load_dotenv()

WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

class Building:
    def __init__(self, 
                 building_id: str, 
                 name: str, 
                 location: Dict[str, float],
                 panel_area: float,
                 installation_date: datetime):
        self.building_id = building_id
        self.name = name
        self.location = location  # {latitude: float, longitude: float}
        self.panel_area = panel_area
        self.installation_date = installation_date
        
    def get_weather_data(self) -> Dict:
        """Fetch current weather data for the building location."""
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': self.location['latitude'],
                'lon': self.location['longitude'],
                'appid': WEATHER_API_KEY,
                'units': 'metric'  # For Celsius
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None

    def predict_solar_output(self, weather_data: Dict) -> float:
        """
        Predict solar panel output based on weather conditions and panel specifications.
        Basic prediction model using weather data.
        """
        if not weather_data:
            return 0.0

        # Base efficiency (typical solar panel efficiency)
        base_efficiency = 0.15

        # Get relevant weather factors
        cloud_cover = weather_data.get('clouds', {}).get('all', 0) / 100  # Convert percentage to decimal
        temperature = weather_data.get('main', {}).get('temp', 20)  # In Celsius
        
        # Solar radiation approximation (simplified)
        # Assume max radiation of 1000 W/m² at optimal conditions
        base_radiation = 1000 * (1 - (0.75 * cloud_cover))  # Reduce based on cloud cover
        
        # Temperature effect (panels are less efficient at higher temperatures)
        # Typical temperature coefficient is -0.4% per degree above 25°C
        temp_effect = 1 - max(0, (temperature - 25) * 0.004)
        
        # Calculate predicted output in watts
        predicted_output = (
            self.panel_area *          # Area in m²
            base_radiation *           # W/m²
            base_efficiency *          # Base panel efficiency
            temp_effect                # Temperature adjustment
        )
        
        return predicted_output / 1000  # Convert to kilowatts

    def to_dict(self) -> Dict:
        return {
            'building_id': self.building_id,
            'name': self.name,
            'location': self.location,
            'panel_area': self.panel_area,
            'installation_date': self.installation_date.isoformat()
        }

class SolarReading:
    def __init__(self,
                 building_id: str,
                 timestamp: datetime,
                 actual_output: float,
                 expected_output: float,
                 weather: str):
        self.building_id = building_id
        self.timestamp = timestamp
        self.actual_output = actual_output
        self.expected_output = expected_output
        self.weather = weather

    def to_dict(self) -> Dict:
        return {
            'building_id': self.building_id,
            'timestamp': self.timestamp.isoformat(),
            'actual_output': self.actual_output,
            'expected_output': self.expected_output,
            'weather': self.weather
        }

class Alert:
    def __init__(self,
                 building_id: str,
                 timestamp: datetime,
                 actual_output: float,
                 expected_output: float,
                 deviation_percentage: float,
                 status: str = 'active'):
        self.building_id = building_id
        self.timestamp = timestamp
        self.actual_output = actual_output
        self.expected_output = expected_output
        self.deviation_percentage = deviation_percentage
        self.status = status  # 'active' or 'resolved'

    def to_dict(self) -> Dict:
        return {
            'building_id': self.building_id,
            'timestamp': self.timestamp.isoformat(),
            'actual_output': self.actual_output,
            'expected_output': self.expected_output,
            'deviation_percentage': self.deviation_percentage,
            'status': self.status
        }
