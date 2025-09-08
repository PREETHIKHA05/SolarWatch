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

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in your project root with the following variables:

**⚠️ IMPORTANT: Never commit your `.env.local` file to version control!**

Copy the `.env.example` file and fill in your actual values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual API keys and database connection string.

#### Getting API Keys:

1. **MongoDB Atlas**: 
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get connection string
   - Replace `<username>`, `<password>`, and `<cluster-url>` with your values

2. **OpenWeatherMap API**:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key from the dashboard

3. **OpenAI API**:
   - Create account at [OpenAI](https://platform.openai.com/)
   - Generate API key in your dashboard
   - **Note**: This requires a paid OpenAI account for GPT-4 access

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Power Analysis
- `POST /api/power-analysis` - Run AI analysis on all buildings
- Returns predictions, actual values, and alerts

### Alerts Management
- `GET /api/alerts` - Get all alerts with filtering options
- `POST /api/alerts` - Acknowledge alerts

### Buildings Data
- `GET /api/buildings` - Get all buildings from MongoDB

### Weather Data
- `GET /api/weather?city=Chennai` - Get weather data for a city

## System Architecture

### AI Prediction Engine (`lib/ai-predictor.ts`)
- Uses OpenAI GPT-4 for sophisticated power predictions
- Combines traditional solar calculations with AI insights
- Factors in weather conditions and historical performance

### Power Simulator (`lib/power-simulator.ts`)
- Simulates realistic power generation
- Models equipment degradation and maintenance cycles
- Includes random variations for real-world accuracy

### Alert System (`lib/alert-system.ts`)
- Analyzes performance deviations
- Generates contextual alerts with root cause analysis
- Manages alert lifecycle and acknowledgments

### Database Schema

#### Buildings Collection
```javascript
{
  _id: "bld-ch-01",
  name: "CH-A",
  city: "Chennai",
  capacityKw: 1200,
  actualKw: 712,
  expectedKw: 860,
  efficiency: 0.83,
  status: "warn",
  coords: { lat: 13.0827, lng: 80.2707 },
  lastUpdated: "2025-01-27T10:30:00Z"
}
```

#### Power History Collection
```javascript
{
  buildingId: "bld-ch-01",
  timestamp: "2025-01-27T10:30:00Z",
  actualKw: 712,
  predictedKw: 850,
  weather: { temperature: 32, humidity: 65, cloudCover: 30 },
  factors: { equipmentEfficiency: 0.92, weatherImpact: 0.85 }
}
```

#### Alerts Collection
```javascript
{
  id: "alert-123",
  buildingId: "bld-ch-01",
  severity: "high",
  title: "High Performance Deviation - 25% Below Expected",
  message: "CH-A is generating 712 kW, which is 138 kW below predicted...",
  acknowledged: false,
  timestamp: "2025-01-27T10:30:00Z"
}
```

## Usage

### Running Analysis
1. Navigate to the dashboard
2. Click "Run AI Power Analysis" 
3. View results in the analysis dashboard
4. Check alerts panel for any issues

### Managing Alerts
1. View alerts in the alerts panel
2. Filter by severity or acknowledgment status
3. Click "Acknowledge" to mark alerts as seen
4. Monitor critical alerts for immediate action

### Auto-Refresh
- Enable auto-refresh for real-time monitoring
- Analysis runs every minute when enabled
- Dashboard updates automatically

## Key Features Explained

### AI Prediction Accuracy
- Combines traditional solar calculations with AI insights
- Uses weather data and historical performance
- Provides confidence scores for reliability assessment

### Alert Intelligence
- Only generates alerts for significant deviations
- Avoids alert spam with smart filtering
- Provides root cause analysis for faster resolution

### Real-Time Monitoring
- Continuous power generation simulation
- Weather-based performance adjustments
- Equipment status monitoring

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **AI**: OpenAI GPT-4
- **Weather**: OpenWeatherMap API
- **Charts**: Recharts
- **UI Components**: Radix UI, shadcn/ui

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details