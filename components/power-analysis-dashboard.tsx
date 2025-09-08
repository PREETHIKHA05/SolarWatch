"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Zap, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react"

interface PowerAnalysisResult {
  buildingId: string
  buildingName: string
  actualKw: number
  predictedKw: number
  difference: number
  differencePercentage: number
  confidence: number
  factors: {
    temperature: number
    cloudiness: number
    humidity: number
    solarRadiation: number
  }
  weather: {
    temperature: number
    humidity: number
    cloudCover: number
    windSpeed: number
  }
  alert?: {
    severity: string
    title: string
    message: string
  }
}

interface AnalysisData {
  results: PowerAnalysisResult[]
  alertStats: any
  totalBuildings: number
  processedBuildings: number
  timestamp: string
}

export function PowerAnalysisDashboard() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    runAnalysis()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runAnalysis, 60000) // Every minute
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/power-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage < 0.1) return 'text-teal-400'
    if (percentage < 0.2) return 'text-yellow-400'
    if (percentage < 0.3) return 'text-orange-400'
    return 'text-red-400'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-teal-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  if (!data && !loading) {
    return (
      <Card className="border-2 border-zinc-800 bg-zinc-950">
        <CardContent className="flex items-center justify-center h-64">
          <Button onClick={runAnalysis} className="bg-teal-600 hover:bg-teal-500">
            <Brain className="mr-2 h-4 w-4" />
            Run AI Power Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-2 border-zinc-800 bg-zinc-950 shadow-[0_0_8px_2px_rgba(0,255,255,0.3)]">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-400" />
              AI Power Analysis Dashboard
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`border-zinc-700 ${autoRefresh ? 'bg-teal-600 text-white' : 'text-zinc-300'}`}
              >
                Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-500"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Run Analysis
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        {data && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">{data.processedBuildings}</div>
                <div className="text-sm text-zinc-400">Buildings Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{data.alertStats?.unacknowledged || 0}</div>
                <div className="text-sm text-zinc-400">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{data.alertStats?.critical || 0}</div>
                <div className="text-sm text-zinc-400">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-300">
                  {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--'}
                </div>
                <div className="text-sm text-zinc-400">Last Updated</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {data && (
        <Card className="border-2 border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-100">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
                <TabsTrigger value="overview" className="text-zinc-300">Overview</TabsTrigger>
                <TabsTrigger value="detailed" className="text-zinc-300">Detailed</TabsTrigger>
                <TabsTrigger value="factors" className="text-zinc-300">Factors</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid gap-4">
                  {data.results.map((result) => (
                    <Card key={result.buildingId} className="border border-zinc-700 bg-zinc-900">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-zinc-100">{result.buildingName}</h3>
                          {result.alert && (
                            <Badge className={`
                              ${result.alert.severity === 'critical' ? 'bg-red-600' : 
                                result.alert.severity === 'high' ? 'bg-orange-500' : 
                                result.alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}
                              text-white
                            `}>
                              {result.alert.severity.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-zinc-400">Actual Output</div>
                            <div className="text-lg font-semibold text-zinc-100">
                              {result.actualKw.toFixed(1)} kW
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-400">AI Predicted</div>
                            <div className="text-lg font-semibold text-teal-400">
                              {result.predictedKw.toFixed(1)} kW
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-400">Difference</div>
                            <div className={`text-lg font-semibold ${getPerformanceColor(result.differencePercentage)}`}>
                              {result.difference > 0 ? '+' : ''}{result.difference.toFixed(1)} kW
                              <span className="text-sm ml-1">
                                ({Math.round(result.differencePercentage * 100)}%)
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-zinc-400">AI Confidence</div>
                            <div className={`text-lg font-semibold ${getConfidenceColor(result.confidence)}`}>
                              {Math.round(result.confidence * 100)}%
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-zinc-400 mb-1">Performance vs Prediction</div>
                          <Progress 
                            value={Math.min(100, (result.actualKw / result.predictedKw) * 100)} 
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="mt-4">
                <div className="space-y-4">
                  {data.results.map((result) => (
                    <Card key={result.buildingId} className="border border-zinc-700 bg-zinc-900">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-zinc-100 mb-4">{result.buildingName}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-2">Power Analysis</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Actual Output:</span>
                                <span className="text-zinc-100">{result.actualKw.toFixed(2)} kW</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">AI Prediction:</span>
                                <span className="text-teal-400">{result.predictedKw.toFixed(2)} kW</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Difference:</span>
                                <span className={getPerformanceColor(result.differencePercentage)}>
                                  {result.difference.toFixed(2)} kW ({Math.round(result.differencePercentage * 100)}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Confidence:</span>
                                <span className={getConfidenceColor(result.confidence)}>
                                  {Math.round(result.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-2">Weather Conditions</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Temperature:</span>
                                <span className="text-zinc-100">{result.weather.temperature.toFixed(1)}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Humidity:</span>
                                <span className="text-zinc-100">{result.weather.humidity}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Cloud Cover:</span>
                                <span className="text-zinc-100">{result.weather.cloudCover}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Wind Speed:</span>
                                <span className="text-zinc-100">{result.weather.windSpeed.toFixed(1)} m/s</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {result.alert && (
                          <div className="mt-4 p-3 rounded border border-red-600 bg-red-950/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="font-medium text-red-300">{result.alert.title}</span>
                            </div>
                            <p className="text-sm text-red-200">{result.alert.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="factors" className="mt-4">
                <div className="space-y-4">
                  {data.results.map((result) => (
                    <Card key={result.buildingId} className="border border-zinc-700 bg-zinc-900">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-zinc-100 mb-4">{result.buildingName}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-3">AI Prediction Factors</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-zinc-400">Temperature Impact</span>
                                  <span className="text-zinc-100">{Math.round(result.factors.temperature * 100)}%</span>
                                </div>
                                <Progress value={result.factors.temperature * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-zinc-400">Cloud Impact</span>
                                  <span className="text-zinc-100">{Math.round(result.factors.cloudiness * 100)}%</span>
                                </div>
                                <Progress value={result.factors.cloudiness * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-zinc-400">Humidity Impact</span>
                                  <span className="text-zinc-100">{Math.round(result.factors.humidity * 100)}%</span>
                                </div>
                                <Progress value={result.factors.humidity * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-zinc-400">Solar Radiation</span>
                                  <span className="text-zinc-100">{Math.round(result.factors.solarRadiation * 100)}%</span>
                                </div>
                                <Progress value={result.factors.solarRadiation * 100} className="h-2" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-3">Performance Indicators</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Overall Efficiency:</span>
                                <span className={`font-medium ${
                                  result.actualKw / result.predictedKw > 0.9 ? 'text-teal-400' :
                                  result.actualKw / result.predictedKw > 0.8 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {Math.round((result.actualKw / result.predictedKw) * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Prediction Accuracy:</span>
                                <span className={getConfidenceColor(result.confidence)}>
                                  {Math.round(result.confidence * 100)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Status:</span>
                                <span className={`font-medium ${
                                  !result.alert ? 'text-teal-400' :
                                  result.alert.severity === 'critical' ? 'text-red-400' :
                                  result.alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                                }`}>
                                  {!result.alert ? 'Normal' : result.alert.severity.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}