"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { TestTube, Play, BarChart3, Loader2, CheckCircle2, XCircle } from "lucide-react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

interface Model {
  name: string
  size: string
}

export default function TestsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")
  const [groundTruth, setGroundTruth] = useState("")
  const [useRag, setUseRag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [metrics, setMetrics] = useState<string[]>(["ragas", "bleu", "rouge", "bertscore", "exact_match"])

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models`)
      setModels(response.data.models || [])
      // Select all models by default
      setSelectedModels(response.data.models?.map((m: Model) => m.name) || [])
    } catch (error) {
      console.error("Error fetching models:", error)
    }
  }

  const runTests = async () => {
    if (!prompt || selectedModels.length === 0) {
      alert("Please provide a prompt and select at least one model")
      return
    }

    setLoading(true)
    setTestResults(null)

    try {
      const response = await axios.post(`${API_URL}/tests/run`, {
        models: selectedModels,
        prompt,
        ground_truth: groundTruth || undefined,
        use_rag: useRag,
        metrics: metrics
      })

      const results = response.data
      setTestResults(results)
      
      // Save to localStorage for evaluation dashboard
      try {
        const history = JSON.parse(localStorage.getItem("test_history") || "[]")
        history.unshift({
          ...results,
          timestamp: new Date().toISOString()
        })
        // Keep only last 50 tests
        localStorage.setItem("test_history", JSON.stringify(history.slice(0, 50)))
      } catch (e) {
        console.error("Error saving test history:", e)
      }
    } catch (error: any) {
      console.error("Error running tests:", error)
      alert(`Error: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev =>
      prev.includes(modelName)
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    )
  }

  const toggleMetric = (metric: string) => {
    setMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <TestTube className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Model Testing</h1>
          <p className="text-muted-foreground">Test and compare all your models with comprehensive metrics</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Configure your test parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Test Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your test prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ground-truth">Ground Truth (Optional)</Label>
              <Textarea
                id="ground-truth"
                placeholder="Expected answer for evaluation metrics..."
                value={groundTruth}
                onChange={(e) => setGroundTruth(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-rag"
                checked={useRag}
                onCheckedChange={(checked) => setUseRag(!!checked)}
              />
              <Label htmlFor="use-rag" className="cursor-pointer">
                Use RAG (Retrieval Augmented Generation)
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Select Models to Test</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {models.map((model) => (
                  <div key={model.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={model.name}
                      checked={selectedModels.includes(model.name)}
                      onCheckedChange={() => toggleModel(model.name)}
                    />
                    <Label htmlFor={model.name} className="cursor-pointer flex-1">
                      {model.name} <span className="text-xs text-muted-foreground">({model.size})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Evaluation Metrics</Label>
              <div className="grid gap-2">
                {["ragas", "bleu", "rouge", "bertscore", "exact_match"].map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric}
                      checked={metrics.includes(metric)}
                      onCheckedChange={() => toggleMetric(metric)}
                    />
                    <Label htmlFor={metric} className="cursor-pointer capitalize">
                      {metric.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={runTests}
              disabled={loading || !prompt || selectedModels.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {testResults ? `Test ID: ${testResults.test_id}` : "Results will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : testResults ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Models Tested: {testResults.models_tested}</span>
                  <span>Total Time: {testResults.total_time?.toFixed(2)}s</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {testResults.results?.map((result: any, idx: number) => (
                    <Card key={idx} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{result.model}</CardTitle>
                          {result.error ? (
                            <XCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {result.error ? (
                          <p className="text-sm text-destructive">{result.error}</p>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm font-medium mb-1">Response:</p>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {result.response}
                              </p>
                            </div>

                            {result.latency && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Total Latency:</span>
                                  <span className="ml-2 font-mono">
                                    {result.latency.total?.toFixed(3)}s
                                  </span>
                                </div>
                                {result.latency.ttft && (
                                  <div>
                                    <span className="text-muted-foreground">TTFT:</span>
                                    <span className="ml-2 font-mono">
                                      {result.latency.ttft.toFixed(3)}s
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {result.tokens && (
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Input:</span>
                                  <span className="ml-1 font-mono">{result.tokens.input}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Output:</span>
                                  <span className="ml-1 font-mono">{result.tokens.output}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total:</span>
                                  <span className="ml-1 font-mono">{result.tokens.total}</span>
                                </div>
                              </div>
                            )}

                            {result.metrics && Object.keys(result.metrics).length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-2">Metrics:</p>
                                <div className="space-y-1 text-xs">
                                  {Object.entries(result.metrics).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace("_", " ")}:
                                      </span>
                                      <span className="font-mono">
                                        {typeof value === "object" 
                                          ? JSON.stringify(value).substring(0, 50) + "..."
                                          : value?.toFixed?.(3) || value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure and run tests to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

