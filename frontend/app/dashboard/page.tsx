"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, RefreshCw, Terminal, Code, Database, Brain, Zap, BarChart3, Gauge } from "lucide-react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

// Service information with icons and descriptions
const SERVICE_INFO: Record<string, ServiceInfo> = {
  "web-ui": {
    name: "Web Dashboard",
    icon: <Code className="h-6 w-6" />,
    tech: "Next.js + TypeScript",
    description: "Modern React dashboard with Shadcn UI for model selection, configuration, and real-time monitoring. Provides intuitive interface for all platform features.",
    color: "bg-blue-500"
  },
  "python-rag": {
    name: "Python RAG Backend",
    icon: <Brain className="h-6 w-6" />,
    tech: "FastAPI + Python",
    description: "RAG pipeline orchestrator with vector database integration, Deepchecks for model accountability, and support for multiple LLM backends including Ollama and local models.",
    color: "bg-green-500"
  },
  "rust-wasm-compute": {
    name: "Rust Compute Engine",
    icon: <Zap className="h-6 w-6" />,
    tech: "Rust + Actix",
    description: "High-performance compute service for latency-critical operations. Uses Rust and WebAssembly for maximum speed in mathematical computations and embeddings.",
    color: "bg-orange-500"
  },
  "qdrant-db": {
    name: "Vector Database",
    icon: <Database className="h-6 w-6" />,
    tech: "Qdrant",
    description: "High-performance vector database for storing and retrieving document embeddings. Enables semantic search and RAG (Retrieval Augmented Generation) capabilities.",
    color: "bg-purple-500"
  },
  "ollama-llm": {
    name: "LLM Runtime",
    icon: <Brain className="h-6 w-6" />,
    tech: "Ollama",
    description: "Local LLM runtime supporting multiple models (Llama, Mistral, etc.). Runs models entirely on-premises with no external API dependencies for sovereign AI operations.",
    color: "bg-indigo-500"
  },
  "prometheus": {
    name: "Metrics Collector",
    icon: <Gauge className="h-6 w-6" />,
    tech: "Prometheus",
    description: "Time-series database and monitoring system. Collects metrics from all services for performance analysis, alerting, and observability.",
    color: "bg-red-500"
  },
  "grafana": {
    name: "Visualization Dashboard",
    icon: <BarChart3 className="h-6 w-6" />,
    tech: "Grafana",
    description: "Advanced analytics and visualization platform. Creates beautiful dashboards from Prometheus metrics for monitoring system performance and health.",
    color: "bg-pink-500"
  }
}

interface Service {
  name: string
  port: number
  url: string
  status: string
  error?: string
}

interface ServiceInfo {
  name: string
  icon: React.ReactNode
  tech: string
  description: string
  color: string
}

interface ServicesResponse {
  services: Service[]
  total: number
  healthy: number
  unhealthy: number
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [logs, setLogs] = useState<string>("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchServices = async () => {
    try {
      const response = await axios.get<ServicesResponse>(`${API_URL}/services`)
      setServices(response.data.services)
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async (serviceName: string) => {
    try {
      // For now, we'll show a message. In production, this would call a logs endpoint
      setLogs(`Logs for ${serviceName} would appear here.\n\nTo view logs in terminal, run:\ndocker compose logs -f ${serviceName}`)
    } catch (error) {
      setLogs(`Error fetching logs: ${error}`)
    }
  }

  useEffect(() => {
    fetchServices()
    if (autoRefresh) {
      const interval = setInterval(fetchServices, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  useEffect(() => {
    if (selectedService) {
      fetchLogs(selectedService)
    }
  }, [selectedService])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "unhealthy":
      case "down":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "timeout":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-300"
      case "unhealthy":
      case "down":
      case "error":
        return "bg-red-100 text-red-800 border-red-300"
      case "timeout":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const healthyCount = services.filter(s => s.status === "healthy").length
  const totalCount = services.length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Pen Knife Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Service Status & Monitoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAutoRefresh(!autoRefresh)
                if (!autoRefresh) fetchServices()
              }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServices}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Unhealthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalCount - healthyCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthyCount > 0 ? `${Math.round((healthyCount / totalCount) * 100)}%` : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Product Cards */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Platform Services</CardTitle>
              <CardDescription>Click a service card to view logs or open in new tab</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading services...</div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No services found</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    const info = SERVICE_INFO[service.name] || {
                      name: service.name,
                      icon: <Code className="h-6 w-6" />,
                      tech: "Unknown",
                      description: "Service component",
                      color: "bg-gray-500"
                    }
                    
                    return (
                      <Card
                        key={service.name}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedService === service.name
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedService(service.name)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${info.color} text-white`}>
                                {info.icon}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{info.name}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {info.tech}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getStatusIcon(service.status)}
                              <span
                                className={`px-2 py-0.5 text-xs rounded ${getStatusColor(
                                  service.status
                                )}`}
                              >
                                {service.status}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {info.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Port {service.port}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(service.url, "_blank")
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                          {service.error && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                              {service.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Logs Viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Logs
              </CardTitle>
              <CardDescription>
                {selectedService
                  ? `Viewing logs for ${selectedService}`
                  : "Select a service to view logs"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedService ? (
                <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-auto">
                  <pre className="whitespace-pre-wrap">{logs || "Loading logs..."}</pre>
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground font-mono text-sm p-4 rounded-lg h-96 flex items-center justify-center">
                  Select a service from the list to view logs
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Open services in new tabs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <Button
                  key={service.name}
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(service.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {service.name} ({service.port})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

