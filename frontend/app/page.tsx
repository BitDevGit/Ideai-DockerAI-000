"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  TestTube, 
  FlaskConical, 
  Brain, 
  Zap, 
  Database, 
  Gauge, 
  BarChart3,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">AI Pen Knife</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sovereign AI Test Platform - High-performance containerized platform for testing LLM/SLM performance, 
          accountability, and RAG capabilities
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-blue-500" />
                <CardTitle>Dashboard</CardTitle>
              </div>
              <CardDescription>Monitor services and view metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tests">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TestTube className="h-8 w-8 text-green-500" />
                <CardTitle>Tests</CardTitle>
              </div>
              <CardDescription>Test and compare all 6 models</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Run Tests <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/services">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FlaskConical className="h-8 w-8 text-purple-500" />
                <CardTitle>Services</CardTitle>
              </div>
              <CardDescription>View and manage all services</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Services Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Platform Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/services/python-rag">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-base">Python RAG</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">RAG backend with evaluation</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services/models">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-base">Model Runner</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">6 LLM models</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services/qdrant">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-base">Qdrant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Vector database</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services/rust-compute">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-base">Rust Compute</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">High-performance compute</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services/prometheus">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-base">Prometheus</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Metrics collection</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/services/grafana">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-pink-500" />
                  <CardTitle className="text-base">Grafana</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Visualization</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>Everything you need to test and evaluate AI models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">Evaluation Metrics</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• RAGAS scoring</li>
                <li>• BLEU/ROUGE</li>
                <li>• BERTScore</li>
                <li>• Exact Match</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TTFT tracking</li>
                <li>• TPOT calculation</li>
                <li>• Throughput</li>
                <li>• Vector latency</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cost & Tokens</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Token usage</li>
                <li>• Cost simulation</li>
                <li>• Model comparison</li>
                <li>• Test reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
