"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react"
import axios from "axios"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
    const interval = setInterval(fetchModels, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models`)
      setModels(response.data.models || [])
    } catch (error) {
      console.error("Error fetching models:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Docker Model Runner</h1>
          <p className="text-muted-foreground">Manage and monitor your 6 LLM models</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>{model.size}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{model.runner}</Badge>
                {model.source && (
                  <Badge variant="outline">{model.source}</Badge>
                )}
              </div>
              {model.format && (
                <p className="text-xs text-muted-foreground">
                  Format: {model.format}
                </p>
              )}
              {model.architecture && (
                <p className="text-xs text-muted-foreground">
                  Architecture: {model.architecture}
                </p>
              )}
              <Link href="/tests">
                <Button variant="outline" className="w-full" size="sm">
                  Test Model
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Docker Model Runner details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Docker Model Runner is Docker Desktop&apos;s built-in service for managing LLM models.
            It runs as a Docker Desktop service (not a container) and provides OpenAI-compatible APIs.
          </p>
          <p className="text-muted-foreground">
            All models are stored locally and managed through Docker Desktop. Models are accessible
            via the Python RAG backend which acts as the orchestrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

