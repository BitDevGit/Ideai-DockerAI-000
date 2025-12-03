"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink, Zap, BarChart3, Database } from "lucide-react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"
const RUST_COMPUTE_URL = process.env.NEXT_PUBLIC_RUST_COMPUTE_URL || "http://localhost:18002"
const GRAFANA_URL = typeof window !== "undefined" 
  ? `${window.location.protocol}//${window.location.hostname}:18007`
  : "http://localhost:18007"

interface Model {
  name: string
  size: string
}

interface Metrics {
  tokensPerSecond?: number
  latency?: number
  errorRate?: number
}

export default function Dashboard() {
  const [selectedModel, setSelectedModel] = useState<string>("llama3.1:8b")
  const [temperature, setTemperature] = useState<number[]>([0.7])
  const [topP, setTopP] = useState<number[]>([0.9])
  const [biasThreshold, setBiasThreshold] = useState<number[]>([0.1])
  const [driftSensitivity, setDriftSensitivity] = useState<number[]>([0.05])
  const [models, setModels] = useState<Model[]>([])
  const [metrics, setMetrics] = useState<Metrics>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchModels()
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models`)
      setModels(response.data.models || [
        { name: "llama3.1:8b", size: "8B" },
        { name: "mistral:7b", size: "7B" }
      ])
    } catch (error) {
      console.error("Error fetching models:", error)
      setModels([
        { name: "llama3.1:8b", size: "8B" },
        { name: "mistral:7b", size: "7B" }
      ])
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/metrics`)
      setMetrics(response.data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
    }
  }

  const runBenchmark = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${RUST_COMPUTE_URL}/benchmark`, {
        iterations: 1000
      })
      alert(`Benchmark completed: ${response.data.result}`)
    } catch (error) {
      console.error("Error running benchmark:", error)
      alert("Error running benchmark")
    } finally {
      setLoading(false)
    }
  }

  const updateModelConfig = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_URL}/config`, {
        model: selectedModel,
        temperature: temperature[0],
        top_p: topP[0],
        bias_threshold: biasThreshold[0],
        drift_sensitivity: driftSensitivity[0]
      })
      alert("Configuration updated successfully")
    } catch (error) {
      console.error("Error updating config:", error)
      alert("Error updating configuration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI Pen Knife</h1>
            <p className="text-muted-foreground mt-2">
              Sovereign AI Test Platform - Performance, Accountability & RAG Testing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open("/dashboard", "_blank")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Open Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(GRAFANA_URL, "_blank")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Open Grafana
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("http://localhost:18006", "_blank")}
            >
              <Database className="mr-2 h-4 w-4" />
              Open Prometheus
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Model Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Model Selector</CardTitle>
              <CardDescription>Choose the LLM model to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name} ({model.size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={updateModelConfig} className="w-full" disabled={loading}>
                Apply Configuration
              </Button>
            </CardContent>
          </Card>

          {/* LLM Hyperparameters */}
          <Card>
            <CardHeader>
              <CardTitle>LLM Hyperparameters</CardTitle>
              <CardDescription>Adjust model generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Temperature</span>
                  <span className="text-muted-foreground">{temperature[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Top P</span>
                  <span className="text-muted-foreground">{topP[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={topP}
                  onValueChange={setTopP}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>

          {/* Deepchecks Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Deepchecks Parameters</CardTitle>
              <CardDescription>Configure accountability test thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bias Threshold</span>
                  <span className="text-muted-foreground">{biasThreshold[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={biasThreshold}
                  onValueChange={setBiasThreshold}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Drift Sensitivity</span>
                  <span className="text-muted-foreground">{driftSensitivity[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={driftSensitivity}
                  onValueChange={setDriftSensitivity}
                  min={0}
                  max={0.5}
                  step={0.01}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time system performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tokens/Sec</span>
                  <span className="text-2xl font-bold">
                    {metrics.tokensPerSecond?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Latency (ms)</span>
                  <span className="text-2xl font-bold">
                    {metrics.latency?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate</span>
                  <span className="text-2xl font-bold">
                    {(metrics.errorRate || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rust/Wasm Benchmark */}
          <Card>
            <CardHeader>
              <CardTitle>Rust/Wasm Benchmark</CardTitle>
              <CardDescription>Test high-performance compute</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runBenchmark}
                className="w-full"
                disabled={loading}
              >
                <Zap className="mr-2 h-4 w-4" />
                {loading ? "Running..." : "Run Benchmark"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

