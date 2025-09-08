"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TriangleAlert, CheckCircle, Clock, AlertTriangle, Zap } from "lucide-react"

interface AlertData {
  id: string
  buildingId: string
  buildingName: string
  type: 'performance' | 'equipment' | 'weather' | 'maintenance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actualKw: number
  predictedKw: number
  difference: number
  differencePercentage: number
  timestamp: string
  acknowledged: boolean
}

interface AlertStats {
  total: number
  unacknowledged: number
  critical: number
  high: number
  medium: number
  low: number
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    unacknowledged: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("unacknowledged")

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
        setStats(prev => ({
          ...prev,
          unacknowledged: prev.unacknowledged - 1
        }))
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <TriangleAlert className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium': return <Zap className="h-4 w-4 text-yellow-500" />
      case 'low': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return '⚙️'
      case 'weather': return '🌤️'
      case 'maintenance': return '🔧'
      default: return '📊'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    switch (activeTab) {
      case 'unacknowledged': return !alert.acknowledged
      case 'critical': return alert.severity === 'critical'
      case 'all': return true
      default: return !alert.acknowledged
    }
  })

  if (loading) {
    return (
      <Card className="border-2 border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-zinc-100">Loading Alerts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)]">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-teal-400" />
          System Alerts
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Badge className={`${getSeverityColor('critical')}`}>
            Critical: {stats.critical}
          </Badge>
          <Badge className={`${getSeverityColor('high')}`}>
            High: {stats.high}
          </Badge>
          <Badge className={`${getSeverityColor('medium')}`}>
            Medium: {stats.medium}
          </Badge>
          <Badge className={`${getSeverityColor('low')}`}>
            Low: {stats.low}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
            <TabsTrigger value="unacknowledged" className="text-zinc-300">
              Unacknowledged ({stats.unacknowledged})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-zinc-300">
              Critical ({stats.critical})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-zinc-300">
              All ({stats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-teal-500" />
                <p>No alerts in this category</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    className={`border-2 ${
                      alert.severity === 'critical' 
                        ? 'border-red-600 bg-red-950/50' 
                        : alert.severity === 'high'
                        ? 'border-orange-500 bg-orange-950/50'
                        : alert.severity === 'medium'
                        ? 'border-yellow-500 bg-yellow-950/50'
                        : 'border-blue-500 bg-blue-950/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <AlertTitle className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            <span>{getTypeIcon(alert.type)}</span>
                            {alert.title}
                            <Badge className={`${getSeverityColor(alert.severity)} text-xs`}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="text-zinc-300 mt-2">
                            <div className="space-y-2">
                              <p><strong>{alert.buildingName}</strong></p>
                              <p>Actual: {alert.actualKw.toFixed(1)} kW | Predicted: {alert.predictedKw.toFixed(1)} kW</p>
                              <p>Difference: {alert.difference.toFixed(1)} kW ({Math.round(alert.differencePercentage * 100)}%)</p>
                              <p className="text-xs text-zinc-400">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white"
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}