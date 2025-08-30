import random
import datetime
import numpy as np
from typing import Dict, List

class SolarSimulator:
    def __init__(self):
        # Base parameters for simulation
        self.peak_output = 1000  # Peak output in watts per square meter
        self.panel_efficiency = 0.20  # 20% efficiency
        self.weather_factors = {
            'sunny': 1.0,
            'partly_cloudy': 0.7,
            'cloudy': 0.4,
            'rainy': 0.2
        }

    def get_solar_position(self, hour: int) -> float:
        """Calculate solar position factor based on hour of day"""
        # Simplified solar position calculation
        if hour < 6 or hour > 18:  # Night time
            return 0.0
        # Peak at noon (hour 12)
        return 1 - abs(hour - 12) / 6

    def simulate_building_output(self, 
                               building_id: str, 
                               panel_area: float,
                               hour: int = None,
                               weather: str = 'sunny') -> Dict:
        """
        Simulate solar panel output for a building
        
        Args:
            building_id: Unique identifier for the building
            panel_area: Total solar panel area in square meters
            hour: Hour of the day (0-23), if None uses current hour
            weather: Weather condition (sunny, partly_cloudy, cloudy, rainy)
        """
        if hour is None:
            hour = datetime.datetime.now().hour

        # Calculate base output
        solar_position = self.get_solar_position(hour)
        weather_factor = self.weather_factors.get(weather, 1.0)
        
        # Base calculation
        base_output = (self.peak_output * 
                      panel_area * 
                      self.panel_efficiency * 
                      solar_position * 
                      weather_factor)

        # Add random noise (±5%)
        noise_factor = 1 + random.uniform(-0.05, 0.05)
        actual_output = base_output * noise_factor

        # Generate timestamp
        timestamp = datetime.datetime.now().isoformat()

        return {
            'building_id': building_id,
            'timestamp': timestamp,
            'actual_output': round(actual_output, 2),
            'expected_output': round(base_output, 2),
            'weather': weather,
            'panel_area': panel_area,
            'hour': hour
        }

    def generate_historical_data(self, 
                               building_id: str, 
                               panel_area: float,
                               days: int = 30) -> List[Dict]:
        """Generate historical data for training"""
        data = []
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=days)
        
        current_date = start_date
        while current_date <= end_date:
            for hour in range(24):
                # Randomly select weather condition with weighted probabilities
                weather = random.choices(
                    ['sunny', 'partly_cloudy', 'cloudy', 'rainy'],
                    weights=[0.6, 0.2, 0.15, 0.05]
                )[0]
                
                reading = self.simulate_building_output(
                    building_id=building_id,
                    panel_area=panel_area,
                    hour=hour,
                    weather=weather
                )
                
                # Update timestamp to historical date
                reading['timestamp'] = current_date.replace(
                    hour=hour
                ).isoformat()
                
                data.append(reading)
            
            current_date += datetime.timedelta(days=1)
        
        return data
