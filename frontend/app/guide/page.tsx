"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, TestTube, BarChart3, Code, Zap, DollarSign, TrendingUp, Play, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function GuidePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Evaluation Platform Guide</h1>
          <p className="text-muted-foreground">Complete guide to testing and evaluating your AI models</p>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started in 3 steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Start Services</h3>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
              <code>{`docker-compose up -d`}</code>
            </pre>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Navigate to Tests Page</h3>
            <p className="text-sm text-muted-foreground">
              Go to <Link href="/tests" className="text-primary underline">Tests</Link> page, select models, enter a prompt, and run tests.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. View Results</h3>
            <p className="text-sm text-muted-foreground">
              Check the <Link href="/evaluation" className="text-primary underline">Evaluation Dashboard</Link> to compare models and analyze metrics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Available Models
          </CardTitle>
          <CardDescription>6 models ready for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: "deepseek-r1-distill-llama", desc: "Distilled Llama model optimized for reasoning" },
              { name: "gpt-oss", desc: "Open-source GPT model" },
              { name: "llama3.1", desc: "Meta's Llama 3.1 model" },
              { name: "mistral", desc: "Mistral AI's efficient model" },
              { name: "qwen3-coder", desc: "Code-focused Qwen model" },
              { name: "qwen3-vl", desc: "Vision-language Qwen model" }
            ].map((model) => (
              <div key={model.name} className="p-3 border rounded-lg">
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-sm text-muted-foreground">{model.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evaluation Metrics
          </CardTitle>
          <CardDescription>Comprehensive metrics for model evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Accuracy Metrics
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">RAGAS Score</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Composite RAG quality metric measuring faithfulness, answer relevancy, context precision, and recall.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">POST /evaluate/ragas</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">BLEU/ROUGE</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Text generation quality metrics comparing generated text to reference.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">POST /evaluate/bleu-rouge</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">BERTScore</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Semantic similarity using BERT embeddings for contextual understanding.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">POST /evaluate/bertscore</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Exact Match</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Fact-based QA accuracy with exact string matching.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">POST /evaluate/exact-match</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Speed Metrics
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">TTFT (Time To First Token)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Measures latency from request to first token generation.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/ttft?model=llama3.1</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">TPOT (Time Per Output Token)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Average time to generate each output token.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/tpot?model=llama3.1</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Throughput</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Requests per second the system can handle.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/throughput</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Vector DB Latency</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Query latency for vector database searches in RAG pipeline.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/vector-latency</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Metrics
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Token Usage</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Track input and output tokens for cost estimation.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/tokens?model=llama3.1</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cost Simulation</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated cost per million tokens based on model pricing.
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">GET /metrics/cost?model=llama3.1</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Usage Examples
          </CardTitle>
          <CardDescription>API examples for common use cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">1. Run Tests on Multiple Models</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`POST /tests/run
{
  "models": ["llama3.1", "mistral", "gpt-oss"],
  "prompt": "Explain quantum computing in one sentence",
  "ground_truth": "Quantum computing uses quantum mechanical phenomena",
  "use_rag": false,
  "metrics": ["ragas", "bleu", "rouge", "bertscore", "exact_match"]
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Comprehensive Evaluation</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`POST /evaluate/comprehensive
{
  "query": "What is machine learning?",
  "context": ["Machine learning is a subset of AI"],
  "answer": "Machine learning is a type of AI",
  "ground_truth": "Machine learning is a subset of artificial intelligence",
  "model": "llama3.1",
  "include_metrics": ["ragas", "bleu", "rouge", "bertscore", "exact_match"]
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Get Model Metrics</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`# Get time to first token
GET /metrics/ttft?model=llama3.1

# Get token usage
GET /metrics/tokens?model=llama3.1

# Get cost estimate
GET /metrics/cost?model=llama3.1`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Run Custom Tests (Pytest)</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`POST /tests/custom
{
  "test_code": "# Your pytest test code here",
  "models": ["llama3.1"],
  "config": {"temperature": 0.7}
}`}</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Or run pytest directly: <code className="bg-muted px-1 rounded">pytest backend/python-rag/testing/</code>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5. LM Evaluation Harness Benchmarks</h3>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`# Run standard benchmark
POST /evaluate/lm-eval
{
  "model": "llama3.1",
  "task": "hellaswag",
  "num_fewshot": 0,
  "limit": 100
}

# Get available benchmarks
GET /evaluate/lm-eval/benchmarks`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Workflow</CardTitle>
          <CardDescription>Step-by-step process for evaluating models</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            <li>
              <strong>Configure Test</strong>
              <p className="text-sm text-muted-foreground ml-6">
                Go to <Link href="/tests" className="text-primary underline">Tests page</Link>, select models, enter prompt and ground truth (optional).
              </p>
            </li>
            <li>
              <strong>Run Tests</strong>
              <p className="text-sm text-muted-foreground ml-6">
                Click &quot;Run Tests&quot; and wait for all models to complete. Results appear in real-time.
              </p>
            </li>
            <li>
              <strong>Analyze Results</strong>
              <p className="text-sm text-muted-foreground ml-6">
                View detailed metrics for each model: accuracy, speed, and token usage.
              </p>
            </li>
            <li>
              <strong>Compare Models</strong>
              <p className="text-sm text-muted-foreground ml-6">
                Go to <Link href="/evaluation" className="text-primary underline">Evaluation Dashboard</Link> for side-by-side comparison.
              </p>
            </li>
            <li>
              <strong>Export Results</strong>
              <p className="text-sm text-muted-foreground ml-6">
                Export test results as JSON for further analysis or reporting.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Pages Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Pages</CardTitle>
          <CardDescription>Navigate through the evaluation platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/tests" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Tests Page
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Run tests on multiple models with custom prompts and metrics
              </p>
            </Link>
            <Link href="/evaluation" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Evaluation Dashboard
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Compare models, view metrics, and analyze performance
              </p>
            </Link>
            <Link href="/dashboard" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Service Dashboard
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor service health and status across the platform
              </p>
            </Link>
            <Link href="/services" className="p-4 border rounded-lg hover:bg-accent transition-colors">
              <h4 className="font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Services Overview
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed information about each service component
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips & Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Use Ground Truth for Better Metrics</h4>
            <p className="text-sm text-muted-foreground">
              Providing ground truth answers enables RAGAS, BLEU, ROUGE, BERTScore, and Exact Match metrics.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Test Multiple Models Simultaneously</h4>
            <p className="text-sm text-muted-foreground">
              Compare all 6 models on the same prompt to identify the best performer for your use case.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Monitor Speed Metrics</h4>
            <p className="text-sm text-muted-foreground">
              TTFT and TPOT are crucial for real-time applications. Check these metrics regularly.
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Export Results Regularly</h4>
            <p className="text-sm text-muted-foreground">
              Export test results to track model performance over time and build your evaluation dataset.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For complete API documentation, see the API reference or check the OpenAPI docs at:
          </p>
          <pre className="bg-muted p-3 rounded-md text-sm">
            <code>http://localhost:18001/docs</code>
          </pre>
          <Button asChild className="mt-4">
            <a href="http://localhost:18001/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open API Docs
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

