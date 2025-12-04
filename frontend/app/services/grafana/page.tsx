"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ExternalLink } from "lucide-react"

export default function GrafanaPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Grafana</h1>
          <p className="text-muted-foreground">Data visualization and analytics</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Grafana visualization platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">18007</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono">admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Password:</span>
                <span className="font-mono">admin</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open("http://localhost:18007", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Grafana
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What Grafana provides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Interactive dashboards</li>
              <li>Real-time metrics visualization</li>
              <li>Performance analytics</li>
              <li>Custom queries and alerts</li>
              <li>Data export capabilities</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

