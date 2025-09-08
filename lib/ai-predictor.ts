import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface WeatherData {
  temperature: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
  solarRadiation?: number;
  uvIndex: number;
  visibility: number;
}

export interface PowerPrediction {
  predictedKw: number;
  confidence: number;
  factors: {
    temperature: number;
    cloudiness: number;
    humidity: number;
    solarRadiation: number;
  };
}

export class AIPowerPredictor {
  private static instance: AIPowerPredictor;
  
  static getInstance(): AIPowerPredictor {
    if (!AIPowerPredictor.instance) {
      AIPowerPredictor.instance = new AIPowerPredictor();
    }
    return AIPowerPredictor.instance;
  }

  async predictPowerOutput(
    weather: WeatherData,
    buildingCapacity: number,
    historicalData?: Array<{ weather: WeatherData; actualOutput: number }>
  ): Promise<PowerPrediction> {
    try {
      // Calculate base solar efficiency factors
      const temperatureFactor = this.calculateTemperatureFactor(weather.temperature);
      const cloudFactor = this.calculateCloudFactor(weather.cloudCover);
      const humidityFactor = this.calculateHumidityFactor(weather.humidity);
      const solarRadiationFactor = this.calculateSolarRadiationFactor(weather.solarRadiation || this.estimateSolarRadiation(weather));

      // Use AI for more sophisticated prediction
      const aiPrediction = await this.getAIPrediction(weather, buildingCapacity, historicalData);
      
      // Combine traditional calculation with AI prediction
      const traditionalPrediction = buildingCapacity * temperatureFactor * cloudFactor * humidityFactor * solarRadiationFactor;
      
      // Weight the predictions (70% AI, 30% traditional for better accuracy)
      const finalPrediction = (aiPrediction * 0.7) + (traditionalPrediction * 0.3);
      
      return {
        predictedKw: Math.max(0, finalPrediction),
        confidence: this.calculateConfidence(weather, historicalData),
        factors: {
          temperature: temperatureFactor,
          cloudiness: cloudFactor,
          humidity: humidityFactor,
          solarRadiation: solarRadiationFactor,
        }
      };
    } catch (error) {
      console.error('AI prediction failed, falling back to traditional method:', error);
      return this.fallbackPrediction(weather, buildingCapacity);
    }
  }

  private async getAIPrediction(
    weather: WeatherData,
    capacity: number,
    historicalData?: Array<{ weather: WeatherData; actualOutput: number }>
  ): Promise<number> {
    const prompt = `
You are an expert solar power prediction AI. Based on the following weather conditions and solar panel capacity, predict the power output in kW.

Weather Conditions:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Cloud Cover: ${weather.cloudCover}%
- Wind Speed: ${weather.windSpeed} m/s
- UV Index: ${weather.uvIndex}
- Visibility: ${weather.visibility} km
- Solar Radiation: ${weather.solarRadiation || 'estimated'} W/m²

Solar Panel Capacity: ${capacity} kW

${historicalData ? `
Historical Data (last 5 similar conditions):
${historicalData.slice(-5).map((d, i) => `
${i + 1}. Weather: ${JSON.stringify(d.weather)} → Actual Output: ${d.actualOutput} kW
`).join('')}
` : ''}

Consider these factors:
1. Optimal solar panel temperature is around 25°C, efficiency decreases by ~0.4% per degree above
2. Cloud cover directly reduces solar irradiance
3. High humidity can reduce efficiency
4. Wind helps cool panels, improving efficiency
5. UV index correlates with solar energy potential

Respond with ONLY a number representing the predicted power output in kW. No explanation needed.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.1,
    });

    const prediction = parseFloat(response.choices[0]?.message?.content?.trim() || '0');
    return isNaN(prediction) ? 0 : prediction;
  }

  private calculateTemperatureFactor(temp: number): number {
    // Optimal temperature around 25°C, efficiency drops ~0.4% per degree above
    const optimalTemp = 25;
    if (temp <= optimalTemp) return 1.0;
    const tempDiff = temp - optimalTemp;
    return Math.max(0.3, 1 - (tempDiff * 0.004));
  }

  private calculateCloudFactor(cloudCover: number): number {
    // Linear relationship: 0% clouds = 100% efficiency, 100% clouds = 20% efficiency
    return Math.max(0.2, 1 - (cloudCover / 100) * 0.8);
  }

  private calculateHumidityFactor(humidity: number): number {
    // High humidity reduces efficiency slightly
    if (humidity <= 60) return 1.0;
    return Math.max(0.85, 1 - ((humidity - 60) / 100) * 0.15);
  }

  private calculateSolarRadiationFactor(radiation: number): number {
    // Normalize based on typical peak solar radiation (~1000 W/m²)
    const peakRadiation = 1000;
    return Math.min(1.0, radiation / peakRadiation);
  }

  private estimateSolarRadiation(weather: WeatherData): number {
    // Estimate solar radiation based on cloud cover and UV index
    const maxRadiation = 1000; // W/m²
    const cloudReduction = weather.cloudCover / 100;
    const uvFactor = Math.min(1, weather.uvIndex / 10);
    
    return maxRadiation * (1 - cloudReduction * 0.8) * uvFactor;
  }

  private calculateConfidence(weather: WeatherData, historicalData?: any[]): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence with historical data
    if (historicalData && historicalData.length > 10) {
      confidence += 0.2;
    }
    
    // Reduce confidence in extreme weather
    if (weather.cloudCover > 80 || weather.temperature > 40 || weather.temperature < 0) {
      confidence -= 0.2;
    }
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private fallbackPrediction(weather: WeatherData, capacity: number): PowerPrediction {
    const tempFactor = this.calculateTemperatureFactor(weather.temperature);
    const cloudFactor = this.calculateCloudFactor(weather.cloudCover);
    const humidityFactor = this.calculateHumidityFactor(weather.humidity);
    const solarFactor = this.calculateSolarRadiationFactor(this.estimateSolarRadiation(weather));
    
    return {
      predictedKw: capacity * tempFactor * cloudFactor * humidityFactor * solarFactor,
      confidence: 0.6,
      factors: {
        temperature: tempFactor,
        cloudiness: cloudFactor,
        humidity: humidityFactor,
        solarRadiation: solarFactor,
      }
    };
  }
}