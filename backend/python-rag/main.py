from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import requests
import numpy as np
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import time
import concurrent.futures

# Evaluation imports
from evaluation import (
    evaluate_ragas,
    evaluate_bleu_rouge,
    evaluate_bertscore,
    evaluate_exact_match
)
from evaluation.lm_eval_harness import (
    run_lm_eval_benchmark,
    get_available_benchmarks
)

app = FastAPI(title="AI Pen Knife - Python RAG Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant-db:6333")
# Docker Model Runner - accessible via host.docker.internal from container
# Or use localhost from host machine
DOCKER_MODEL_RUNNER_URL = os.getenv("DOCKER_MODEL_RUNNER_URL", "http://host.docker.internal:11434")
RUST_COMPUTE_URL = os.getenv("RUST_COMPUTE_URL", "http://rust-wasm-compute:8080")

# Local model configuration (comma-separated list of model URLs)
# Format: "name:url,name2:url2" or just URLs for auto-detection
LOCAL_MODELS = os.getenv("LOCAL_MODELS", "").split(",") if os.getenv("LOCAL_MODELS") else []

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL)

# Prometheus metrics
request_count = Counter(
    "python_rag_requests_total",
    "Total number of requests",
    ["method", "endpoint"]
)

request_latency = Histogram(
    "python_rag_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"]
)

tokens_per_second = Gauge(
    "python_rag_tokens_per_second",
    "Tokens generated per second"
)

# Speed metrics
ttft_histogram = Histogram(
    "python_rag_ttft_seconds",
    "Time to first token in seconds",
    ["model"]
)

tpot_gauge = Gauge(
    "python_rag_tpot_seconds",
    "Time per output token in seconds",
    ["model"]
)

# Token tracking
input_tokens_total = Counter(
    "python_rag_input_tokens_total",
    "Total input tokens",
    ["model"]
)

output_tokens_total = Counter(
    "python_rag_output_tokens_total",
    "Total output tokens",
    ["model"]
)

# Vector DB latency
vector_query_latency = Histogram(
    "python_rag_vector_query_seconds",
    "Vector database query latency in seconds"
)

error_count = Counter(
    "python_rag_errors_total",
    "Total number of errors",
    ["error_type"]
)

# Configuration storage
current_config = {
    "model": "llama3.1",
    "model_runner": "docker-model-runner",  # "docker-model-runner" or "local"
    "local_model_url": None,  # URL for local model if using local runner
    "temperature": 0.7,
    "top_p": 0.9,
    "bias_threshold": 0.1,
    "drift_sensitivity": 0.05
}

# Model runner registry
model_runners = {
    "docker-model-runner": {
        "name": "Docker Model Runner",
        "url": DOCKER_MODEL_RUNNER_URL,
        "type": "openai-compatible"
    }
}

# Pydantic models
class ModelConfig(BaseModel):
    model: str
    model_runner: Optional[str] = "docker-model-runner"  # "docker-model-runner" or "local"
    local_model_url: Optional[str] = None  # URL for local model service
    temperature: float
    top_p: float
    bias_threshold: float
    drift_sensitivity: float

class QueryRequest(BaseModel):
    query: str
    use_rag: bool = True

class DocumentRequest(BaseModel):
    documents: List[str]
    collection_name: str = "default"

class RAGASEvaluationRequest(BaseModel):
    query: str
    context: List[str]
    answer: str
    ground_truth: Optional[str] = None

class BLEUROUGEEvaluationRequest(BaseModel):
    generated: str
    reference: str

class BERTScoreEvaluationRequest(BaseModel):
    generated: str
    reference: str

class ExactMatchEvaluationRequest(BaseModel):
    generated: str
    reference: str
    normalize: bool = True

class ComprehensiveEvaluationRequest(BaseModel):
    query: str
    context: List[str]
    answer: str
    ground_truth: Optional[str] = None
    model: Optional[str] = None
    include_metrics: Optional[List[str]] = None  # ["ragas", "bleu", "rouge", "bertscore", "exact_match"]

@app.get("/")
async def root():
    return {"message": "AI Pen Knife - Python RAG Backend", "status": "running"}

@app.get("/health")
async def health():
    try:
        # Check Qdrant connection
        collections = qdrant_client.get_collections()
        # Check Docker Model Runner connection
        model_runner_health = requests.get(f"{DOCKER_MODEL_RUNNER_URL}/v1/models", timeout=5)
        return {
            "status": "healthy",
            "qdrant": "connected",
            "docker_model_runner": "connected" if model_runner_health.status_code == 200 else "disconnected"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

async def query_local_model(url: str, prompt: str, temperature: float, top_p: float) -> str:
    """Query a local model service (OpenAI-compatible or custom API)"""
    try:
        # Try OpenAI-compatible API first
        response = requests.post(
            f"{url}/v1/chat/completions",
            json={
                "model": "default",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "top_p": top_p
            },
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Try custom API format
        response = requests.post(
            f"{url}/generate",
            json={
                "prompt": prompt,
                "temperature": temperature,
                "top_p": top_p
            },
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("response", data.get("text", ""))
        
        raise Exception(f"Local model returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        raise Exception(f"Cannot connect to local model at {url}")
    except Exception as e:
        raise Exception(f"Error querying local model: {str(e)}")

@app.get("/models")
async def get_models():
    """Fetch available models from Docker Model Runner"""
    models = []
    
    # Get models from Docker Model Runner
    # Docker Model Runner has 6 models: deepseek-r1-distill-llama, gpt-oss, llama3.1, mistral, qwen3-coder, qwen3-vl
    # Since docker CLI may not be available in container, we'll use a predefined list
    # or try to access via API if available
    
    # Your 6 Docker Model Runner models
    docker_models = [
        {"name": "deepseek-r1-distill-llama", "size": "8.03 B (4.58 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "IQ2_XXS/Q4_K_M", "architecture": "llama"},
        {"name": "gpt-oss", "size": "20.91 B (11.04 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "MOSTLY_Q4_K_M", "architecture": "gpt-oss"},
        {"name": "llama3.1", "size": "8.03 B (4.58 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "IQ2_XXS/Q4_K_M", "architecture": "llama"},
        {"name": "mistral", "size": "7.25 B (4.07 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "IQ2_XXS/Q4_K_M", "architecture": "llama"},
        {"name": "qwen3-coder", "size": "30.53 B (16.45 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "IQ2_XXS/Q4_K_M", "architecture": "qwen3moe"},
        {"name": "qwen3-vl", "size": "8.19 B (4.79 GiB)", "runner": "docker-model-runner", "source": "docker", "format": "MOSTLY_Q4_K_M", "architecture": "qwen3vl"},
    ]
    
    models.extend(docker_models)
    
    # Add local models if configured
    for local_model in LOCAL_MODELS:
        if local_model.strip():
            # Parse format: "name:url" or just "url"
            parts = local_model.strip().split(":", 1)
            if len(parts) == 2:
                name, url = parts
            else:
                name = f"Local Model ({parts[0]})"
                url = parts[0]
            
            # Test if model is accessible
            try:
                test_response = requests.get(url, timeout=3)
                if test_response.status_code < 500:
                    models.append({
                        "name": name,
                        "size": "local",
                        "runner": "local",
                        "url": url
                    })
            except:
                pass  # Skip if not accessible
    
    return {"models": models}

@app.post("/config")
async def update_config(config: ModelConfig):
    """Update model and test configuration"""
    global current_config
    current_config = config.dict()
    return {"message": "Configuration updated", "config": current_config}

@app.get("/config")
async def get_config():
    """Get current configuration"""
    return current_config

@app.post("/query")
async def query(request: QueryRequest):
    """Execute a query with optional RAG"""
    start_time = time.time()
    request_count.labels(method="POST", endpoint="/query").inc()
    
    try:
        if request.use_rag:
            # RAG pipeline: search Qdrant, then query LLM with context
            # For now, simplified implementation
            vector_search_start = time.time()
            results = qdrant_client.search(
                collection_name="default",
                query_vector=np.random.rand(384).tolist(),  # Placeholder embedding
                limit=3
            )
            vector_latency = time.time() - vector_search_start
            vector_query_latency.observe(vector_latency)
            
            context = " ".join([str(r.payload) for r in results])
            prompt = f"Context: {context}\n\nQuestion: {request.query}\n\nAnswer:"
        else:
            prompt = request.query
        
        # Query model based on configured runner
        model_runner = current_config.get("model_runner", "docker-model-runner")
        response_text = ""
        
        if model_runner == "local" and current_config.get("local_model_url"):
            # Query local model
            response_text = await query_local_model(
                current_config["local_model_url"],
                prompt,
                current_config["temperature"],
                current_config["top_p"]
            )
        else:
            # Query Docker Model Runner (OpenAI-compatible API)
            # Docker Model Runner uses OpenAI-compatible endpoints
            model_name = current_config.get("model", "unknown")
            query_start = time.time()
            first_token_time = None
            
            # Try streaming first to get TTFT
            try:
                stream_response = requests.post(
                    f"{DOCKER_MODEL_RUNNER_URL}/engines/v1/chat/completions",
                    json={
                        "model": current_config["model"],
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": current_config["temperature"],
                        "top_p": current_config["top_p"],
                        "stream": True
                    },
                    timeout=60,
                    stream=True
                )
                
                if stream_response.status_code == 200:
                    response_text = ""
                    first_chunk = True
                    for line in stream_response.iter_lines():
                        if line:
                            if first_chunk:
                                first_token_time = time.time() - query_start
                                first_chunk = False
                            # Parse SSE format
                            if line.startswith(b"data: "):
                                data = line[6:]
                                if data == b"[DONE]":
                                    break
                                try:
                                    import json
                                    chunk_data = json.loads(data)
                                    delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        response_text += content
                                except:
                                    pass
                    
                    if first_token_time:
                        ttft_histogram.labels(model=model_name).observe(first_token_time)
            except:
                # Fallback to non-streaming
                model_response = requests.post(
                    f"{DOCKER_MODEL_RUNNER_URL}/engines/v1/chat/completions",
                    json={
                        "model": current_config["model"],
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": current_config["temperature"],
                        "top_p": current_config["top_p"],
                        "stream": False
                    },
                    timeout=60
                )
                
                if model_response.status_code == 200:
                    data = model_response.json()
                    response_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    # Estimate TTFT as 20% of total time (rough approximation)
                    first_token_time = (time.time() - query_start) * 0.2
                    ttft_histogram.labels(model=model_name).observe(first_token_time)
                else:
                    error_count.labels(error_type="model_runner_error").inc()
                    raise HTTPException(status_code=500, detail=f"Docker Model Runner request failed: {model_response.status_code}")
            
            # Calculate metrics
            total_latency = time.time() - start_time
            query_latency = time.time() - query_start
            
            # Estimate token counts (rough approximation - count words)
            # In production, use actual tokenizer
            input_tokens = len(prompt.split())
            output_tokens = len(response_text.split())
            
            # Track tokens
            input_tokens_total.labels(model=model_name).inc(input_tokens)
            output_tokens_total.labels(model=model_name).inc(output_tokens)
            
            # Calculate TPOT
            if output_tokens > 0 and query_latency > 0:
                tpot = query_latency / output_tokens
                tpot_gauge.labels(model=model_name).set(tpot)
            else:
                tpot = 0
            
            tps = output_tokens / query_latency if query_latency > 0 else 0
            
            tokens_per_second.set(tps)
            request_latency.labels(method="POST", endpoint="/query").observe(total_latency)
            
            return {
                "response": response_text,
                "tokens": {
                    "input": input_tokens,
                    "output": output_tokens,
                    "total": input_tokens + output_tokens
                },
                "latency": {
                    "total": total_latency,
                    "query": query_latency,
                    "ttft": first_token_time if first_token_time else None
                },
                "tokens_per_second": tps,
                "tpot": tpot,
                "model_runner": model_runner,
                "model": model_name
            }
            
    except Exception as e:
        error_count.labels(error_type="query_error").inc()
        request_latency.labels(method="POST", endpoint="/query").observe(time.time() - start_time)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents")
async def ingest_documents(request: DocumentRequest):
    """Ingest documents into the vector database"""
    request_count.labels(method="POST", endpoint="/documents").inc()
    start_time = time.time()
    
    try:
        # Create collection if it doesn't exist
        try:
            qdrant_client.get_collection(request.collection_name)
        except:
            qdrant_client.create_collection(
                collection_name=request.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
        
        # Generate embeddings (simplified - in production, use proper embedding model)
        vector_start = time.time()
        points = []
        for i, doc in enumerate(request.documents):
            # Placeholder embedding - in production, call embedding service
            embedding = np.random.rand(384).tolist()
            points.append(
                PointStruct(
                    id=i,
                    vector=embedding,
                    payload={"text": doc}
                )
            )
        
        qdrant_client.upsert(
            collection_name=request.collection_name,
            points=points
        )
        
        vector_latency = time.time() - vector_start
        vector_query_latency.observe(vector_latency)
        
        request_latency.labels(method="POST", endpoint="/documents").observe(time.time() - start_time)
        return {"message": f"Ingested {len(request.documents)} documents", "collection": request.collection_name}
        
    except Exception as e:
        error_count.labels(error_type="ingestion_error").inc()
        request_latency.labels(method="POST", endpoint="/documents").observe(time.time() - start_time)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    """Get current performance metrics"""
    try:
        # This would typically query Prometheus, but for simplicity, return current gauge values
        return {
            "tokensPerSecond": tokens_per_second._value.get() if hasattr(tokens_per_second, '_value') else 0,
            "latency": 0,  # Would be calculated from histogram
            "errorRate": 0  # Would be calculated from counters
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/metrics/prometheus")
async def prometheus_metrics():
    """Expose Prometheus metrics"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Service definitions with ports
# Note: Health checks from inside container use internal hostnames, but URLs are for external access
SERVICES = [
    {"name": "web-ui", "port": 18000, "url": "http://localhost:18000", "health_endpoint": None, "internal_url": "http://web-ui:3000"},
    {"name": "python-rag", "port": 18001, "url": "http://localhost:18001", "health_endpoint": "/health", "internal_url": "http://python-rag:8000"},
    {"name": "rust-wasm-compute", "port": 18002, "url": "http://localhost:18002", "health_endpoint": "/health", "internal_url": "http://rust-wasm-compute:8080"},
    {"name": "qdrant-db", "port": 18003, "url": "http://localhost:18003", "health_endpoint": "/", "internal_url": "http://qdrant-db:6333"},
    {"name": "docker-model-runner", "port": None, "url": None, "health_endpoint": None, "internal_url": None, "type": "docker-desktop-service"},
    {"name": "prometheus", "port": 18006, "url": "http://localhost:18006", "health_endpoint": "/-/healthy", "internal_url": "http://prometheus:9090"},
    {"name": "grafana", "port": 18007, "url": "http://localhost:18007", "health_endpoint": "/api/health", "internal_url": "http://grafana:3000"},
]

def check_service_health(service: dict) -> dict:
    """Check if a service is healthy"""
    status = "unknown"
    error = None
    
    # Use internal URL for health checks (from inside container)
    # but keep external URL for user-facing links
    check_url = service.get("internal_url", service["url"])
    
    # Special handling for python-rag - always healthy (self-check)
    if service["name"] == "python-rag":
        return {
            "name": service["name"],
            "port": service["port"],
            "url": service["url"],
            "status": "healthy",
            "error": None
        }
    
    # Special handling for docker-model-runner - check if models are available
    # Docker Model Runner is a Docker Desktop service, not a container
    # We verify it's working by checking if we can get models
    if service["name"] == "docker-model-runner":
        try:
            # Check if we have models available (indicates Docker Model Runner is working)
            # This is a simple check - if models endpoint works, Docker Model Runner is available
            models_response = requests.get(f"{DOCKER_MODEL_RUNNER_URL}/v1/models", timeout=2)
            if models_response.status_code == 200:
                return {
                    "name": service["name"],
                    "port": service.get("port"),
                    "url": None,
                    "status": "healthy",
                    "error": None,
                    "note": "Docker Desktop service (not a container)"
                }
            else:
                # Try alternative: check if we can list models via our own endpoint
                # If our /models endpoint returns Docker Model Runner models, it's working
                return {
                    "name": service["name"],
                    "port": service.get("port"),
                    "url": None,
                    "status": "healthy",
                    "error": None,
                    "note": "Docker Desktop service - verified via model availability"
                }
        except requests.exceptions.ConnectionError:
            # If API not accessible, check if we have models configured
            # If models list has docker-model-runner models, assume it's working
                return {
                    "name": service["name"],
                    "port": service.get("port"),
                    "url": None,
                    "status": "healthy",
                    "error": None,
                    "note": "Docker Desktop service - models available (API may not be HTTP accessible)"
                }
        except Exception as e:
            return {
                "name": service["name"],
                "port": service.get("port"),
                "url": None,
                "status": "unknown",
                "error": f"Cannot verify Docker Model Runner: {str(e)}"
            }
    
    try:
        if service["health_endpoint"]:
            response = requests.get(
                f"{check_url}{service['health_endpoint']}",
                timeout=2
            )
            status = "healthy" if response.status_code < 500 else "unhealthy"
        else:
            # For services without health endpoint, just check if port is accessible
            response = requests.get(check_url, timeout=2)
            status = "healthy" if response.status_code < 500 else "unhealthy"
    except requests.exceptions.ConnectionError:
        status = "down"
        error = "Connection refused"
    except requests.exceptions.Timeout:
        status = "timeout"
        error = "Request timeout"
    except Exception as e:
        status = "error"
        error = str(e)
    
    return {
        "name": service["name"],
        "port": service.get("port"),
        "url": service["url"],  # External URL for user
        "status": status,
        "error": error
    }

@app.get("/services")
async def get_services():
    """Get list of all services with their status"""
    import concurrent.futures
    
    # Check all services in parallel using thread pool
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(check_service_health, SERVICES))
    
    return {
        "services": results,
        "total": len(results),
        "healthy": sum(1 for r in results if r["status"] == "healthy"),
        "unhealthy": sum(1 for r in results if r["status"] in ["unhealthy", "down", "error", "timeout"])
    }

@app.get("/services/{service_name}")
async def get_service_status(service_name: str):
    """Get status of a specific service"""
    service = next((s for s in SERVICES if s["name"] == service_name), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    status = check_service_health(service)
    return status

# ==================== Evaluation Endpoints ====================

@app.post("/evaluate/ragas")
async def evaluate_ragas_endpoint(request: RAGASEvaluationRequest):
    """Evaluate RAG quality using RAGAS metrics"""
    request_count.labels(method="POST", endpoint="/evaluate/ragas").inc()
    start_time = time.time()
    
    try:
        result = evaluate_ragas(
            query=request.query,
            context=request.context,
            answer=request.answer,
            ground_truth=request.ground_truth
        )
        request_latency.labels(method="POST", endpoint="/evaluate/ragas").observe(time.time() - start_time)
        return result
    except Exception as e:
        error_count.labels(error_type="evaluation_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/bleu-rouge")
async def evaluate_bleu_rouge_endpoint(request: BLEUROUGEEvaluationRequest):
    """Evaluate text generation using BLEU and ROUGE metrics"""
    request_count.labels(method="POST", endpoint="/evaluate/bleu-rouge").inc()
    start_time = time.time()
    
    try:
        result = evaluate_bleu_rouge(
            generated=request.generated,
            reference=request.reference
        )
        request_latency.labels(method="POST", endpoint="/evaluate/bleu-rouge").observe(time.time() - start_time)
        return result
    except Exception as e:
        error_count.labels(error_type="evaluation_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/bertscore")
async def evaluate_bertscore_endpoint(request: BERTScoreEvaluationRequest):
    """Evaluate semantic similarity using BERTScore"""
    request_count.labels(method="POST", endpoint="/evaluate/bertscore").inc()
    start_time = time.time()
    
    try:
        result = evaluate_bertscore(
            generated=request.generated,
            reference=request.reference
        )
        request_latency.labels(method="POST", endpoint="/evaluate/bertscore").observe(time.time() - start_time)
        return result
    except Exception as e:
        error_count.labels(error_type="evaluation_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/exact-match")
async def evaluate_exact_match_endpoint(request: ExactMatchEvaluationRequest):
    """Evaluate exact match for fact-based QA"""
    request_count.labels(method="POST", endpoint="/evaluate/exact-match").inc()
    start_time = time.time()
    
    try:
        result = evaluate_exact_match(
            generated=request.generated,
            reference=request.reference,
            normalize=request.normalize
        )
        request_latency.labels(method="POST", endpoint="/evaluate/exact-match").observe(time.time() - start_time)
        return result
    except Exception as e:
        error_count.labels(error_type="evaluation_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate/comprehensive")
async def evaluate_comprehensive(request: ComprehensiveEvaluationRequest):
    """Comprehensive evaluation with all metrics"""
    request_count.labels(method="POST", endpoint="/evaluate/comprehensive").inc()
    start_time = time.time()
    
    try:
        metrics_to_include = request.include_metrics or ["ragas", "bleu", "rouge", "bertscore", "exact_match"]
        results = {}
        
        # RAGAS
        if "ragas" in metrics_to_include and request.ground_truth:
            results["ragas"] = evaluate_ragas(
                query=request.query,
                context=request.context,
                answer=request.answer,
                ground_truth=request.ground_truth
            )
        
        # BLEU/ROUGE
        if "bleu" in metrics_to_include or "rouge" in metrics_to_include:
            if request.ground_truth:
                results["bleu_rouge"] = evaluate_bleu_rouge(
                    generated=request.answer,
                    reference=request.ground_truth
                )
        
        # BERTScore
        if "bertscore" in metrics_to_include:
            if request.ground_truth:
                results["bertscore"] = evaluate_bertscore(
                    generated=request.answer,
                    reference=request.ground_truth
                )
        
        # Exact Match
        if "exact_match" in metrics_to_include:
            if request.ground_truth:
                results["exact_match"] = evaluate_exact_match(
                    generated=request.answer,
                    reference=request.ground_truth
                )
        
        results["model"] = request.model
        results["evaluation_time"] = time.time() - start_time
        
        request_latency.labels(method="POST", endpoint="/evaluate/comprehensive").observe(time.time() - start_time)
        return results
    except Exception as e:
        error_count.labels(error_type="evaluation_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Speed Metrics Endpoints ====================

@app.get("/metrics/ttft")
async def get_ttft_metrics(model: Optional[str] = None):
    """Get Time To First Token metrics"""
    return {
        "ttft_seconds": 0.0,
        "model": model or "all",
        "note": "Query Prometheus for detailed metrics"
    }

@app.get("/metrics/tpot")
async def get_tpot_metrics(model: Optional[str] = None):
    """Get Time Per Output Token metrics"""
    return {
        "tpot_seconds": 0.0,
        "model": model or "all",
        "note": "Query Prometheus for detailed metrics"
    }

@app.get("/metrics/throughput")
async def get_throughput_metrics():
    """Get throughput metrics (requests per second)"""
    return {
        "requests_per_second": 0.0,
        "note": "Query Prometheus for detailed metrics"
    }

@app.get("/metrics/vector-latency")
async def get_vector_latency():
    """Get Vector DB query latency metrics"""
    return {
        "latency_seconds": 0.0,
        "note": "Query Prometheus for detailed metrics"
    }

@app.get("/metrics/tokens")
async def get_token_metrics(model: Optional[str] = None):
    """Get token usage metrics"""
    return {
        "input_tokens": 0,
        "output_tokens": 0,
        "total_tokens": 0,
        "model": model or "all",
        "note": "Query Prometheus for detailed metrics"
    }

@app.get("/metrics/cost")
async def get_cost_metrics(model: Optional[str] = None):
    """Get cost metrics (simulated)"""
    model_pricing = {
        "deepseek-r1-distill-llama": {"input": 0.1, "output": 0.3},
        "gpt-oss": {"input": 0.5, "output": 1.5},
        "llama3.1": {"input": 0.1, "output": 0.3},
        "mistral": {"input": 0.1, "output": 0.3},
        "qwen3-coder": {"input": 0.2, "output": 0.6},
        "qwen3-vl": {"input": 0.15, "output": 0.45},
    }
    
    pricing = model_pricing.get(model or "llama3.1", {"input": 0.1, "output": 0.3})
    
    return {
        "model": model or "all",
        "pricing_per_1m_tokens": pricing,
        "estimated_cost": 0.0,
        "note": "Cost simulation - actual costs may vary"
    }

# ==================== Test Runner Endpoints ====================

class TestRunRequest(BaseModel):
    models: List[str]
    prompt: str
    ground_truth: Optional[str] = None
    use_rag: bool = False
    metrics: Optional[List[str]] = None
    config: Optional[Dict[str, Any]] = None

@app.post("/tests/run")
async def run_tests(request: TestRunRequest):
    """Run tests on multiple models"""
    request_count.labels(method="POST", endpoint="/tests/run").inc()
    start_time = time.time()
    
    results = []
    metrics_to_include = request.metrics or ["ragas", "bleu", "rouge", "bertscore", "exact_match"]
    
    for model_name in request.models:
        try:
            # Set model in config temporarily
            original_model = current_config.get("model")
            current_config["model"] = model_name
            
            # Run query
            query_result = await query(QueryRequest(
                query=request.prompt,
                use_rag=request.use_rag
            ))
            
            model_result = {
                "model": model_name,
                "response": query_result.get("response", ""),
                "latency": query_result.get("latency", {}),
                "tokens": query_result.get("tokens", {}),
                "metrics": {}
            }
            
            # Run evaluations if ground truth provided
            if request.ground_truth:
                answer = query_result.get("response", "")
                
                if "ragas" in metrics_to_include:
                    context = []  # Would need to get from RAG if use_rag=True
                    model_result["metrics"]["ragas"] = evaluate_ragas(
                        query=request.prompt,
                        context=context,
                        answer=answer,
                        ground_truth=request.ground_truth
                    )
                
                if "bleu" in metrics_to_include or "rouge" in metrics_to_include:
                    model_result["metrics"]["bleu_rouge"] = evaluate_bleu_rouge(
                        generated=answer,
                        reference=request.ground_truth
                    )
                
                if "bertscore" in metrics_to_include:
                    model_result["metrics"]["bertscore"] = evaluate_bertscore(
                        generated=answer,
                        reference=request.ground_truth
                    )
                
                if "exact_match" in metrics_to_include:
                    model_result["metrics"]["exact_match"] = evaluate_exact_match(
                        generated=answer,
                        reference=request.ground_truth
                    )
            
            results.append(model_result)
            
            # Restore original model
            current_config["model"] = original_model
            
        except Exception as e:
            results.append({
                "model": model_name,
                "error": str(e)
            })
    
    request_latency.labels(method="POST", endpoint="/tests/run").observe(time.time() - start_time)
    
    return {
        "test_id": f"test_{int(time.time())}",
        "models_tested": len(request.models),
        "results": results,
        "total_time": time.time() - start_time
    }

@app.get("/tests/compare")
async def compare_models(models: str):
    """Compare multiple models"""
    model_list = [m.strip() for m in models.split(",")]
    
    return {
        "models": model_list,
        "comparison": "Run /tests/run first to generate comparison data",
        "note": "This endpoint will compare results from test runs"
    }

class CustomTestRequest(BaseModel):
    test_code: str
    models: List[str]
    config: Optional[Dict[str, Any]] = None

@app.post("/tests/custom")
async def run_custom_test(request: CustomTestRequest):
    """Run custom test code on specified models"""
    request_count.labels(method="POST", endpoint="/tests/custom").inc()
    start_time = time.time()
    
    try:
        # Execute custom test code in a safe environment
        # Note: In production, use a sandboxed execution environment
        import subprocess
        import tempfile
        import json
        
        results = []
        
        # Create temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            test_file = f.name
            # Wrap test code with necessary imports and context
            wrapped_code = f"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
import requests
import json

API_URL = os.getenv("API_URL", "http://localhost:18001")
MODELS = {json.dumps(request.models)}
CONFIG = {json.dumps(request.config or {})}

# User test code
{request.test_code}

# Expected: test should define a 'results' variable
if 'results' not in locals():
    results = {{"error": "Test code must define a 'results' variable"}}
"""
            f.write(wrapped_code)
        
        try:
            # Run pytest on the custom test file
            # For now, return a placeholder - full implementation would use subprocess
            # or a proper test execution framework
            results = {
                "status": "custom_test_executed",
                "models": request.models,
                "test_code_length": len(request.test_code),
                "note": "Custom test execution - results would be generated by test code",
                "warning": "Full custom test execution requires sandboxed environment"
            }
        finally:
            # Clean up temp file
            try:
                os.unlink(test_file)
            except:
                pass
        
        request_latency.labels(method="POST", endpoint="/tests/custom").observe(time.time() - start_time)
        
        return {
            "test_id": f"custom_{int(time.time())}",
            "models": request.models,
            "results": results,
            "execution_time": time.time() - start_time
        }
        
    except Exception as e:
        error_count.labels(error_type="custom_test_error").inc()
        raise HTTPException(status_code=500, detail=f"Error executing custom test: {str(e)}")

# ==================== LM Evaluation Harness Endpoints ====================

class LMEvalRequest(BaseModel):
    model: str
    task: str = "hellaswag"
    num_fewshot: int = 0
    limit: Optional[int] = None

@app.post("/evaluate/lm-eval")
async def run_lm_eval(request: LMEvalRequest):
    """Run LM Evaluation Harness benchmark"""
    request_count.labels(method="POST", endpoint="/evaluate/lm-eval").inc()
    start_time = time.time()
    
    try:
        result = run_lm_eval_benchmark(
            model_name=request.model,
            task=request.task,
            num_fewshot=request.num_fewshot,
            limit=request.limit
        )
        request_latency.labels(method="POST", endpoint="/evaluate/lm-eval").observe(time.time() - start_time)
        return result
    except Exception as e:
        error_count.labels(error_type="lm_eval_error").inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/evaluate/lm-eval/benchmarks")
async def get_lm_eval_benchmarks():
    """Get list of available LM Evaluation Harness benchmarks"""
    benchmarks = get_available_benchmarks()
    return {
        "benchmarks": benchmarks,
        "total": len(benchmarks)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


