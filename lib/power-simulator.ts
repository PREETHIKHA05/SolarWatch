export interface SimulatedPowerData {
  buildingId: string;
  timestamp: Date;
  actualKw: number;
  factors: {
    baseGeneration: number;
    weatherImpact: number;
    equipmentEfficiency: number;
    maintenanceStatus: number;
    randomVariation: number;
  };
  equipmentStatus: {
    inverterEfficiency: number;
    panelDegradation: number;
    soiling: number;
    shading: number;
  };
}

export class PowerSimulator {
  private static instance: PowerSimulator;
  
  static getInstance(): PowerSimulator {
    if (!PowerSimulator.instance) {
      PowerSimulator.instance = new PowerSimulator();
    }
    return PowerSimulator.instance;
  }

  simulateActualPowerOutput(
    buildingId: string,
    capacityKw: number,
    weather: any,
    timeOfDay: number = new Date().getHours()
  ): SimulatedPowerData {
    // Base generation based on time of day (solar curve)
    const baseGeneration = this.calculateSolarCurve(timeOfDay, capacityKw);
    
    // Weather impact on actual output
    const weatherImpact = this.calculateWeatherImpact(weather);
    
    // Equipment efficiency factors
    const equipmentStatus = this.simulateEquipmentStatus(buildingId);
    const equipmentEfficiency = this.calculateEquipmentEfficiency(equipmentStatus);
    
    // Maintenance status (random degradation over time)
    const maintenanceStatus = this.simulateMaintenanceStatus(buildingId);
    
    // Random variation (±5% for real-world unpredictability)
    const randomVariation = 0.95 + (Math.random() * 0.1);
    
    // Calculate final actual output
    const actualKw = Math.max(0, 
      baseGeneration * 
      weatherImpact * 
      equipmentEfficiency * 
      maintenanceStatus * 
      randomVariation
    );

    return {
      buildingId,
      timestamp: new Date(),
      actualKw,
      factors: {
        baseGeneration,
        weatherImpact,
        equipmentEfficiency,
        maintenanceStatus,
        randomVariation,
      },
      equipmentStatus,
    };
  }

  private calculateSolarCurve(hour: number, capacity: number): number {
    // Solar generation follows a bell curve throughout the day
    // Peak at noon (12), minimal at night
    if (hour < 6 || hour > 18) return 0; // No generation at night
    
    // Bell curve calculation
    const peakHour = 12;
    const width = 6; // Hours of significant generation
    const curve = Math.exp(-Math.pow(hour - peakHour, 2) / (2 * Math.pow(width / 2.5, 2)));
    
    return capacity * curve;
  }

  private calculateWeatherImpact(weather: any): number {
    if (!weather) return 0.8; // Default if no weather data
    
    let impact = 1.0;
    
    // Temperature impact (optimal around 25°C)
    if (weather.main?.temp) {
      const temp = weather.main.temp;
      if (temp > 25) {
        impact *= Math.max(0.7, 1 - ((temp - 25) * 0.004));
      }
    }
    
    // Cloud cover impact
    if (weather.clouds?.all) {
      const cloudCover = weather.clouds.all;
      impact *= Math.max(0.2, 1 - (cloudCover / 100) * 0.8);
    }
    
    // Humidity impact
    if (weather.main?.humidity) {
      const humidity = weather.main.humidity;
      if (humidity > 60) {
        impact *= Math.max(0.85, 1 - ((humidity - 60) / 100) * 0.15);
      }
    }
    
    // Wind helps cooling (slight positive impact)
    if (weather.wind?.speed) {
      const windSpeed = weather.wind.speed;
      impact *= Math.min(1.05, 1 + (windSpeed * 0.01));
    }
    
    return Math.max(0.1, impact);
  }

  private simulateEquipmentStatus(buildingId: string) {
    // Use building ID as seed for consistent simulation
    const seed = this.hashCode(buildingId);
    const random = this.seededRandom(seed);
    
    return {
      inverterEfficiency: 0.92 + (random() * 0.06), // 92-98%
      panelDegradation: 0.95 + (random() * 0.04), // 95-99% (panels degrade over time)
      soiling: 0.85 + (random() * 0.1), // 85-95% (dust, bird droppings, etc.)
      shading: 0.9 + (random() * 0.08), // 90-98% (trees, buildings, etc.)
    };
  }

  private calculateEquipmentEfficiency(status: any): number {
    return status.inverterEfficiency * 
           status.panelDegradation * 
           status.soiling * 
           status.shading;
  }

  private simulateMaintenanceStatus(buildingId: string): number {
    // Simulate maintenance cycles and equipment degradation
    const seed = this.hashCode(buildingId + Date.now().toString().slice(0, -5)); // Changes every ~3 hours
    const random = this.seededRandom(seed);
    
    // 90-99% efficiency based on maintenance status
    return 0.9 + (random() * 0.09);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
}