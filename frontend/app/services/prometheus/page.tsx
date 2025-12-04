"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gauge, ExternalLink } from "lucide-react"

export default function PrometheusPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Gauge className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Prometheus</h1>
          <p className="text-muted-foreground">Metrics collection and monitoring</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Prometheus monitoring system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">18006</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600">Running</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("http://localhost:18006", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Prometheus
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metrics Collected</CardTitle>
            <CardDescription>What Prometheus tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Request counts and latency</li>
              <li>Token generation rates</li>
              <li>Error rates</li>
              <li>TTFT and TPOT metrics</li>
              <li>Vector DB query latency</li>
              <li>Service health status</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

