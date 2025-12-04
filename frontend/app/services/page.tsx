"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Code,
  Brain,
  Zap,
  Database,
  Gauge,
  BarChart3,
  FlaskConical
} from "lucide-react"
import Link from "next/link"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

interface Service {
  name: string
  port: number | null
  url: string | null
  status: string
  error?: string
  note?: string
}

interface ServicesResponse {
  services: Service[]
  total: number
  healthy: number
  unhealthy: number
}

const SERVICE_INFO: Record<string, { name: string; icon: React.ReactNode; tech: string; description: string; color: string; page?: string }> = {
  "web-ui": {
    name: "Web Dashboard",
    icon: <Code className="h-6 w-6" />,
    tech: "Next.js + TypeScript",
    description: "Modern React dashboard with Shadcn UI for model selection, configuration, and real-time monitoring.",
    color: "bg-blue-500",
    page: "/services/web-ui"
  },
  "python-rag": {
    name: "Python RAG Backend",
    icon: <Brain className="h-6 w-6" />,
    tech: "FastAPI + Python",
    description: "RAG pipeline orchestrator with vector database integration, evaluation metrics, and model management.",
    color: "bg-green-500",
    page: "/services/python-rag"
  },
  "rust-wasm-compute": {
    name: "Rust Compute Engine",
    icon: <Zap className="h-6 w-6" />,
    tech: "Rust + Actix",
    description: "High-performance compute service for latency-critical operations and mathematical computations.",
    color: "bg-orange-500",
    page: "/services/rust-compute"
  },
  "qdrant-db": {
    name: "Vector Database",
    icon: <Database className="h-6 w-6" />,
    tech: "Qdrant",
    description: "High-performance vector database for storing and retrieving document embeddings for RAG.",
    color: "bg-purple-500",
    page: "/services/qdrant"
  },
  "docker-model-runner": {
    name: "Docker Model Runner",
    icon: <Brain className="h-6 w-6" />,
    tech: "Docker Desktop",
    description: "Docker&apos;s built-in model runner managing 6 LLM models. Runs as Docker Desktop service.",
    color: "bg-indigo-500",
    page: "/services/models"
  },
  "prometheus": {
    name: "Metrics Collector",
    icon: <Gauge className="h-6 w-6" />,
    tech: "Prometheus",
    description: "Time-series monitoring system that collects metrics from all services for performance analysis.",
    color: "bg-yellow-500",
    page: "/services/prometheus"
  },
  "grafana": {
    name: "Visualization Dashboard",
    icon: <BarChart3 className="h-6 w-6" />,
    tech: "Grafana",
    description: "Data visualization and analytics platform for creating interactive dashboards from Prometheus metrics.",
    color: "bg-pink-500",
    page: "/services/grafana"
  },
}

function getStatusIcon(status: string) {
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

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "bg-green-100 text-green-800"
    case "unhealthy":
    case "down":
    case "error":
      return "bg-red-100 text-red-800"
    case "timeout":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchServices()
    if (autoRefresh) {
      const interval = setInterval(fetchServices, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">Monitor and manage all platform services</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchServices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const info = SERVICE_INFO[service.name] || {
            name: service.name,
            icon: <FlaskConical className="h-6 w-6" />,
            tech: "Unknown",
            description: "Service information",
            color: "bg-gray-500"
          }

          return (
            <Card
              key={service.name}
              className="cursor-pointer hover:shadow-lg transition-shadow"
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
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {info.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {service.port ? `Port ${service.port}` : "Docker Desktop service"}
                  </span>
                  <div className="flex gap-2">
                    {info.page && (
                      <Link href={info.page}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    )}
                    {service.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(service.url!, "_blank")
                        }}
                      >
                        Open <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {service.note && (
                  <p className="text-xs text-muted-foreground italic">
                    {service.note}
                  </p>
                )}
                {service.error && (
                  <p className="text-xs text-destructive">
                    {service.error}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

