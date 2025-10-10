# AI-Powered Solar Monitoring System

A comprehensive solar power monitoring system that uses AI to predict power output based on weather conditions and compares it with actual generation to provide intelligent alerts.

## Features

### 🤖 AI-Powered Predictions
- Uses OpenAI GPT-4 to predict solar power output based on weather conditions
- Considers multiple factors: temperature, humidity, cloud cover, wind speed, UV index
- Learns from historical data to improve accuracy over time
- Provides confidence scores for predictions

### ⚡ Real-Time Power Simulation
- Simulates realistic power generation with multiple factors:
  - Solar curve based on time of day
  - Weather impact on actual output
  - Equipment efficiency (inverters, panel degradation, soiling)
  - Maintenance status and random variations

### 🚨 Intelligent Alert System
- Compares AI predictions with actual output
- Generates alerts for significant deviations
- Four severity levels: Low, Medium, High, Critical
- Root cause analysis (equipment, weather, maintenance issues)
- Alert acknowledgment and tracking

### 📊 Comprehensive Dashboard
- Real-time power analysis dashboard
- Visual comparison of predicted vs actual output
- Performance factors breakdown
- Weather condition monitoring
- Alert management panel

### 🗄️ MongoDB Integration
- Stores building data, power history, and alerts
- Scalable cloud database architecture
- Historical data analysis for AI training

