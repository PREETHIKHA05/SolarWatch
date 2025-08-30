import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from typing import Dict, List, Tuple

class SolarPredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.encoder = OneHotEncoder(sparse_output=False)
        self.is_trained = False

    def prepare_features(self, data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for model training or prediction"""
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Extract hour from timestamp if not already present
        if 'hour' not in df.columns:
            df['hour'] = pd.to_datetime(df['timestamp']).dt.hour

        # Prepare weather encoding
        weather_encoded = self.encoder.fit_transform(df[['weather']])
        
        # Combine features
        features = np.column_stack([
            df['hour'],
            df['panel_area'],
            weather_encoded
        ])
        
        return features, df['actual_output'].values

    def train(self, historical_data: List[Dict]) -> None:
        """Train the model on historical data"""
        X, y = self.prepare_features(historical_data)
        self.model.fit(X, y)
        self.is_trained = True

    def predict(self, input_data: Dict) -> float:
        """Predict solar output for given conditions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")

        # Prepare single input for prediction
        features, _ = self.prepare_features([input_data])
        
        # Make prediction
        prediction = self.model.predict(features)[0]
        
        return round(prediction, 2)

    def calculate_deviation(self, actual: float, predicted: float) -> Dict:
        """Calculate deviation between actual and predicted values"""
        absolute_deviation = abs(actual - predicted)
        percentage_deviation = (absolute_deviation / predicted) * 100 if predicted > 0 else 0
        
        return {
            'absolute_deviation': round(absolute_deviation, 2),
            'percentage_deviation': round(percentage_deviation, 2)
        }

    def check_alert_condition(self, 
                            actual: float, 
                            predicted: float, 
                            threshold: float = 15.0) -> bool:
        """Check if deviation warrants an alert"""
        deviation = self.calculate_deviation(actual, predicted)
        return deviation['percentage_deviation'] > threshold
