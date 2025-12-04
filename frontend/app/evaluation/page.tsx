"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Download, RefreshCw, Award, Zap, DollarSign } from "lucide-react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18001"

interface EvaluationResult {
  model: string
  metrics: {
    ragas?: { ragas_score: number }
    bleu_rouge?: { bleu: number; rouge_l: number }
    bertscore?: { f1: number }
    exact_match?: { score: number }
  }
  latency?: { total: number; ttft?: number }
  tokens?: { input: number; output: number; total: number }
}

export default function EvaluationPage() {
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<EvaluationResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTestHistory()
    // Also try to load comparison data from latest test
    loadComparisonData()
  }, [])

  const loadTestHistory = async () => {
    // Load recent test results
    try {
      const stored = localStorage.getItem("test_history")
      if (stored) {
        const history = JSON.parse(stored)
        setTestHistory(history.slice(0, 10)) // Last 10 tests
      }
    } catch (error) {
      console.error("Error loading test history:", error)
    }
  }

  const loadComparisonData = () => {
    // Load latest test results for comparison
    try {
      const stored = localStorage.getItem("test_history")
      if (stored) {
        const history = JSON.parse(stored)
        if (history.length > 0) {
          const latest = history[0]
          if (latest.results) {
            setComparisonData(latest.results)
          }
        }
      }
    } catch (error) {
      console.error("Error loading comparison data:", error)
    }
  }

  const exportResults = (results: any) => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `evaluation-${results.test_id || Date.now()}.json`
    link.click()
  }

  const getMetricValue = (result: EvaluationResult, metric: string): number => {
    if (!result.metrics) return 0
    switch (metric) {
      case "ragas":
        return result.metrics.ragas?.ragas_score || 0
      case "bleu":
        return result.metrics.bleu_rouge?.bleu || 0
      case "rouge":
        return result.metrics.bleu_rouge?.rouge_l || 0
      case "bertscore":
        return result.metrics.bertscore?.f1 || 0
      case "exact_match":
        return result.metrics.exact_match?.score || 0
      default:
        return 0
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Evaluation Dashboard</h1>
            <p className="text-muted-foreground">Compare models and analyze performance metrics</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => { loadTestHistory(); loadComparisonData(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testHistory.length}</div>
            <p className="text-xs text-muted-foreground">Tests run</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comparisonData.length > 0
                ? (comparisonData.reduce((sum, r) => sum + (r.latency?.total || 0), 0) / comparisonData.length).toFixed(2)
                : "0.00"}s
            </div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Model</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comparisonData.length > 0
                ? comparisonData.reduce((best, current) => {
                    const bestScore = getMetricValue(best, "ragas")
                    const currentScore = getMetricValue(current, "ragas")
                    return currentScore > bestScore ? current : best
                  }, comparisonData[0])?.model || "N/A"
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">By RAGAS score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comparisonData.reduce((sum, r) => sum + (r.tokens?.total || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison View */}
      {comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Model Comparison</CardTitle>
                <CardDescription>Side-by-side metric comparison</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportResults({ comparison: comparisonData })}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Model</th>
                    <th className="text-right p-2">RAGAS</th>
                    <th className="text-right p-2">BLEU</th>
                    <th className="text-right p-2">ROUGE</th>
                    <th className="text-right p-2">BERTScore</th>
                    <th className="text-right p-2">Exact Match</th>
                    <th className="text-right p-2">Latency (s)</th>
                    <th className="text-right p-2">TTFT (s)</th>
                    <th className="text-right p-2">Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((result, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-medium">{result.model}</td>
                      <td className="text-right p-2">{getMetricValue(result, "ragas").toFixed(3)}</td>
                      <td className="text-right p-2">{getMetricValue(result, "bleu").toFixed(3)}</td>
                      <td className="text-right p-2">{getMetricValue(result, "rouge").toFixed(3)}</td>
                      <td className="text-right p-2">{getMetricValue(result, "bertscore").toFixed(3)}</td>
                      <td className="text-right p-2">{getMetricValue(result, "exact_match").toFixed(3)}</td>
                      <td className="text-right p-2">{result.latency?.total?.toFixed(3) || "N/A"}</td>
                      <td className="text-right p-2">{result.latency?.ttft?.toFixed(3) || "N/A"}</td>
                      <td className="text-right p-2">{result.tokens?.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
          <CardDescription>View and export previous test results</CardDescription>
        </CardHeader>
        <CardContent>
          {testHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No test history available</p>
              <p className="text-sm mt-2">Run tests from the Tests page to see results here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {testHistory.map((test, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{test.test_id || `Test ${idx + 1}`}</p>
                    <p className="text-sm text-muted-foreground">
                      {test.models_tested} models • {test.total_time?.toFixed(2)}s
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportResults(test)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

