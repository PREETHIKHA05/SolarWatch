import clientPromise from "@/lib/mongo";
import { AIPowerPredictor } from "@/lib/ai-predictor";
import { PowerSimulator } from "@/lib/power-simulator";
import { AlertSystem } from "@/lib/alert-system";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get all buildings
    const buildings = await db.collection("buildings").find({}).toArray();
    
    const predictor = AIPowerPredictor.getInstance();
    const simulator = PowerSimulator.getInstance();
    const alertSystem = AlertSystem.getInstance();
    
    const results = [];
    
    for (const building of buildings) {
      try {
        // Get weather data for the building's location
        const weather = await getWeatherData(building.city);
        
        // Get historical data for better AI prediction
        const historicalData = await db.collection("power_history")
          .find({ buildingId: building._id.toString() })
          .sort({ timestamp: -1 })
          .limit(50)
          .toArray();

        // Convert weather data to our format
        const weatherData = {
          temperature: weather?.main?.temp || 25,
          humidity: weather?.main?.humidity || 50,
          cloudCover: weather?.clouds?.all || 20,
          windSpeed: weather?.wind?.speed || 2,
          uvIndex: weather?.uvi || 5,
          visibility: weather?.visibility ? weather.visibility / 1000 : 10,
        };

        // Get AI prediction
        const prediction = await predictor.predictPowerOutput(
          weatherData,
          building.capacityKw,
          historicalData.map(h => ({
            weather: h.weather,
            actualOutput: h.actualKw
          }))
        );

        // Simulate actual power output
        const actualData = simulator.simulateActualPowerOutput(
          building._id.toString(),
          building.capacityKw,
          weather
        );

        // Analyze for alerts
        const alert = alertSystem.analyzePerformance(
          building._id.toString(),
          building.name,
          actualData.actualKw,
          prediction.predictedKw,
          {
            ...actualData.factors,
            factors: prediction.factors,
            equipmentEfficiency: actualData.factors.equipmentEfficiency,
            maintenanceStatus: actualData.factors.maintenanceStatus,
            weatherImpact: actualData.factors.weatherImpact
          }
        );

        // Update building in database
        await db.collection("buildings").updateOne(
          { _id: building._id },
          {
            $set: {
              actualKw: actualData.actualKw,
              expectedKw: prediction.predictedKw,
              efficiency: actualData.actualKw / building.capacityKw,
              status: actualData.actualKw < prediction.predictedKw * 0.7 ? 'critical' : 
                     actualData.actualKw < prediction.predictedKw * 0.8 ? 'warn' : 'ok',
              lastUpdated: new Date().toISOString(),
              aiPrediction: prediction,
              simulationData: actualData
            }
          }
        );

        // Store power history
        await db.collection("power_history").insertOne({
          buildingId: building._id.toString(),
          buildingName: building.name,
          timestamp: new Date(),
          actualKw: actualData.actualKw,
          predictedKw: prediction.predictedKw,
          weather: weatherData,
          factors: actualData.factors,
          equipmentStatus: actualData.equipmentStatus,
          prediction: prediction
        });

        // Store alert if generated
        if (alert) {
          await db.collection("alerts").insertOne(alert);
        }

        results.push({
          buildingId: building._id.toString(),
          buildingName: building.name,
          actualKw: actualData.actualKw,
          predictedKw: prediction.predictedKw,
          difference: actualData.actualKw - prediction.predictedKw,
          differencePercentage: Math.abs(actualData.actualKw - prediction.predictedKw) / prediction.predictedKw,
          alert: alert ? {
            severity: alert.severity,
            title: alert.title,
            message: alert.message
          } : null,
          confidence: prediction.confidence,
          factors: prediction.factors,
          weather: weatherData
        });

      } catch (buildingError) {
        console.error(`Error processing building ${building.name}:`, buildingError);
        results.push({
          buildingId: building._id.toString(),
          buildingName: building.name,
          error: buildingError.message
        });
      }
    }

    // Get alert statistics
    const alertStats = alertSystem.getAlertStats();

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      alertStats,
      totalBuildings: buildings.length,
      processedBuildings: results.filter(r => !r.error).length
    });

  } catch (error) {
    console.error('Power analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to perform power analysis',
      details: error.message 
    });
  }
}

async function getWeatherData(city) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      console.warn('WEATHER_API_KEY not configured, weather data unavailable');
      return null;
    }

    // Map city codes to actual city names
    const cityMap = {
      'Chennai': 'Chennai',
      'Thiruvallur': 'Thiruvallur',
      'Kancheepuram': 'Kancheepuram',
      'Chengalpet': 'Chengalpet',
      'Trichy': 'Tiruchirappalli'
    };

    const cityName = cityMap[city] || city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}