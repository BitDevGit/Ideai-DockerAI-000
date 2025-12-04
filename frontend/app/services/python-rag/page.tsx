"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, ExternalLink, Code, Database, Zap, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import axios from "axios"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

export default function PythonRAGPage() {
  const [health, setHealth] = useState<any>(null)
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [healthRes, modelsRes] = await Promise.all([
        axios.get(`${API_URL}/health`),
        axios.get(`${API_URL}/models`)
      ])
      setHealth(healthRes.data)
      setModels(modelsRes.data.models || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Python RAG Backend</h1>
          <p className="text-muted-foreground">FastAPI service for RAG pipeline, evaluation, and model management</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Health and connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {health ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge className={health.status === "healthy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {health.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Qdrant</span>
                  <Badge className={health.qdrant === "connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {health.qdrant}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Docker Model Runner</span>
                  <Badge className={health.docker_model_runner === "connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {health.docker_model_runner}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
            <Button onClick={fetchData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
            <CardDescription>{models.length} models available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {models.map((model) => (
                <div key={model.name} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.size}</p>
                  </div>
                  <Badge variant="outline">{model.runner}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Available endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <code className="text-xs">POST /query</code>
                <span className="text-muted-foreground">Query models</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs">POST /evaluate/comprehensive</code>
                <span className="text-muted-foreground">Run evaluations</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs">POST /tests/run</code>
                <span className="text-muted-foreground">Test models</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs">GET /models</code>
                <span className="text-muted-foreground">List models</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs">GET /metrics/*</code>
                <span className="text-muted-foreground">Performance metrics</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => window.open(`${API_URL}/docs`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open API Docs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to related pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/tests">
              <Button variant="outline" className="w-full justify-start">
                <Code className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
            </Link>
            <Link href="/services/qdrant">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Vector Database
              </Button>
            </Link>
            <Link href="/services/models">
              <Button variant="outline" className="w-full justify-start">
                <Brain className="h-4 w-4 mr-2" />
                Model Runner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

