export interface Alert {
  id: string;
  buildingId: string;
  buildingName: string;
  type: 'performance' | 'equipment' | 'weather' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actualKw: number;
  predictedKw: number;
  difference: number;
  differencePercentage: number;
  timestamp: Date;
  acknowledged: boolean;
  factors?: any;
}

export interface AlertThresholds {
  lowThreshold: number; // 10% difference
  mediumThreshold: number; // 20% difference
  highThreshold: number; // 30% difference
  criticalThreshold: number; // 50% difference
}

export class AlertSystem {
  private static instance: AlertSystem;
  private alerts: Alert[] = [];
  private thresholds: AlertThresholds = {
    lowThreshold: 0.1,
    mediumThreshold: 0.2,
    highThreshold: 0.3,
    criticalThreshold: 0.5,
  };

  static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }

  analyzePerformance(
    buildingId: string,
    buildingName: string,
    actualKw: number,
    predictedKw: number,
    factors?: any
  ): Alert | null {
    // Skip analysis if predicted power is very low (night time, etc.)
    if (predictedKw < 10) return null;

    const difference = actualKw - predictedKw;
    const differencePercentage = Math.abs(difference) / predictedKw;

    // Only create alerts for significant underperformance
    if (difference >= 0 && differencePercentage < this.thresholds.lowThreshold) {
      return null; // Performance is good
    }

    const severity = this.calculateSeverity(differencePercentage, difference);
    const alert = this.createAlert(
      buildingId,
      buildingName,
      actualKw,
      predictedKw,
      difference,
      differencePercentage,
      severity,
      factors
    );

    // Check if similar alert already exists (avoid spam)
    const existingAlert = this.alerts.find(a => 
      a.buildingId === buildingId && 
      a.severity === severity &&
      !a.acknowledged &&
      (Date.now() - a.timestamp.getTime()) < 3600000 // Within last hour
    );

    if (!existingAlert) {
      this.alerts.unshift(alert);
      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(0, 100);
      }
      return alert;
    }

    return null;
  }

  private calculateSeverity(differencePercentage: number, difference: number): Alert['severity'] {
    if (differencePercentage >= this.thresholds.criticalThreshold) {
      return 'critical';
    } else if (differencePercentage >= this.thresholds.highThreshold) {
      return 'high';
    } else if (differencePercentage >= this.thresholds.mediumThreshold) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private createAlert(
    buildingId: string,
    buildingName: string,
    actualKw: number,
    predictedKw: number,
    difference: number,
    differencePercentage: number,
    severity: Alert['severity'],
    factors?: any
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buildingId,
      buildingName,
      type: this.determineAlertType(factors),
      severity,
      title: this.generateAlertTitle(severity, differencePercentage),
      message: this.generateAlertMessage(buildingName, actualKw, predictedKw, difference, differencePercentage, factors),
      actualKw,
      predictedKw,
      difference,
      differencePercentage,
      timestamp: new Date(),
      acknowledged: false,
      factors,
    };

    return alert;
  }

  private determineAlertType(factors?: any): Alert['type'] {
    if (!factors) return 'performance';

    // Analyze factors to determine root cause
    if (factors.equipmentEfficiency < 0.8) {
      return 'equipment';
    } else if (factors.maintenanceStatus < 0.85) {
      return 'maintenance';
    } else if (factors.weatherImpact < 0.6) {
      return 'weather';
    } else {
      return 'performance';
    }
  }

  private generateAlertTitle(severity: Alert['severity'], differencePercentage: number): string {
    const percentage = Math.round(differencePercentage * 100);
    
    switch (severity) {
      case 'critical':
        return `🚨 Critical Performance Issue - ${percentage}% Below Expected`;
      case 'high':
        return `⚠️ High Performance Deviation - ${percentage}% Below Expected`;
      case 'medium':
        return `⚡ Performance Warning - ${percentage}% Below Expected`;
      case 'low':
        return `📊 Minor Performance Deviation - ${percentage}% Below Expected`;
      default:
        return `Performance Alert - ${percentage}% Below Expected`;
    }
  }

  private generateAlertMessage(
    buildingName: string,
    actualKw: number,
    predictedKw: number,
    difference: number,
    differencePercentage: number,
    factors?: any
  ): string {
    const percentage = Math.round(differencePercentage * 100);
    let message = `${buildingName} is generating ${actualKw.toFixed(1)} kW, which is ${Math.abs(difference).toFixed(1)} kW (${percentage}%) below the AI-predicted output of ${predictedKw.toFixed(1)} kW.`;

    if (factors) {
      message += '\n\nPossible causes:';
      
      if (factors.equipmentEfficiency < 0.8) {
        message += '\n• Equipment efficiency issues detected';
      }
      if (factors.maintenanceStatus < 0.85) {
        message += '\n• Maintenance required';
      }
      if (factors.weatherImpact < 0.6) {
        message += '\n• Adverse weather conditions';
      }
      if (factors.factors?.cloudiness < 0.5) {
        message += '\n• High cloud cover reducing solar irradiance';
      }
      if (factors.factors?.temperature < 0.8) {
        message += '\n• High temperature reducing panel efficiency';
      }
    }

    return message;
  }

  getAlerts(buildingId?: string, acknowledged?: boolean): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (buildingId) {
      filteredAlerts = filteredAlerts.filter(a => a.buildingId === buildingId);
    }

    if (acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(a => a.acknowledged === acknowledged);
    }

    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  getCriticalAlerts(): Alert[] {
    return this.alerts.filter(a => a.severity === 'critical' && !a.acknowledged);
  }

  getAlertStats() {
    const unacknowledged = this.alerts.filter(a => !a.acknowledged);
    return {
      total: this.alerts.length,
      unacknowledged: unacknowledged.length,
      critical: unacknowledged.filter(a => a.severity === 'critical').length,
      high: unacknowledged.filter(a => a.severity === 'high').length,
      medium: unacknowledged.filter(a => a.severity === 'medium').length,
      low: unacknowledged.filter(a => a.severity === 'low').length,
    };
  }
}