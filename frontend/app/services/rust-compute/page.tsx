"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, ExternalLink, RefreshCw } from "lucide-react"
import axios from "axios"

const RUST_COMPUTE_URL = process.env.NEXT_PUBLIC_RUST_COMPUTE_URL || "http://localhost:18002"

export default function RustComputePage() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await axios.get(`${RUST_COMPUTE_URL}/health`)
      setHealth(response.data)
    } catch (error) {
      console.error("Error fetching health:", error)
      setHealth({ status: "unhealthy" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Rust Compute Engine</h1>
          <p className="text-muted-foreground">High-performance compute service</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {health ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={health.status === "healthy" ? "text-green-600" : "text-red-600"}>
                    {health.status}
                  </span>
                </div>
                {health.version && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-mono">{health.version}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading...</p>
            )}
            <Button onClick={fetchHealth} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What Rust Compute provides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ultra-fast mathematical operations</li>
              <li>Low-latency compute tasks</li>
              <li>Embedding generation</li>
              <li>Benchmark testing</li>
              <li>Rust + Actix performance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Available endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-1">
              <code className="text-xs">POST /benchmark</code>
              <p className="text-xs text-muted-foreground">Run performance benchmarks</p>
            </div>
            <div className="space-y-1">
              <code className="text-xs">GET /health</code>
              <p className="text-xs text-muted-foreground">Service health check</p>
            </div>
            <div className="space-y-1">
              <code className="text-xs">GET /metrics</code>
              <p className="text-xs text-muted-foreground">Performance metrics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

