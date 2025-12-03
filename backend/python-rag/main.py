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
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama-llm:11434")
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

error_count = Counter(
    "python_rag_errors_total",
    "Total number of errors",
    ["error_type"]
)

# Configuration storage
current_config = {
    "model": "llama3.1:8b",
    "model_runner": "ollama",  # "ollama" or "local"
    "local_model_url": None,  # URL for local model if using local runner
    "temperature": 0.7,
    "top_p": 0.9,
    "bias_threshold": 0.1,
    "drift_sensitivity": 0.05
}

# Model runner registry
model_runners = {
    "ollama": {
        "name": "Ollama",
        "url": OLLAMA_URL,
        "type": "ollama"
    }
}

# Pydantic models
class ModelConfig(BaseModel):
    model: str
    model_runner: Optional[str] = "ollama"  # "ollama" or "local"
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

@app.get("/")
async def root():
    return {"message": "AI Pen Knife - Python RAG Backend", "status": "running"}

@app.get("/health")
async def health():
    try:
        # Check Qdrant connection
        collections = qdrant_client.get_collections()
        # Check Ollama connection
        ollama_health = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        return {
            "status": "healthy",
            "qdrant": "connected",
            "ollama": "connected" if ollama_health.status_code == 200 else "disconnected"
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
    """Fetch available models from Ollama and local model runners"""
    models = []
    
    # Get Ollama models
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=10)
        if response.status_code == 200:
            data = response.json()
            ollama_models = [
                {"name": model["name"], "size": model.get("size_vram", "unknown"), "runner": "ollama"}
                for model in data.get("models", [])
            ]
            models.extend(ollama_models)
    except Exception as e:
        print(f"Error fetching Ollama models: {e}")
    
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
    
    # Fallback if no models found
    if not models:
        models = [
            {"name": "llama3.1:8b", "size": "8B", "runner": "ollama"},
            {"name": "mistral:7b", "size": "7B", "runner": "ollama"}
        ]
    
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
            results = qdrant_client.search(
                collection_name="default",
                query_vector=np.random.rand(384).tolist(),  # Placeholder embedding
                limit=3
            )
            context = " ".join([str(r.payload) for r in results])
            prompt = f"Context: {context}\n\nQuestion: {request.query}\n\nAnswer:"
        else:
            prompt = request.query
        
        # Query model based on configured runner
        model_runner = current_config.get("model_runner", "ollama")
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
            # Query Ollama (default)
            ollama_response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": current_config["model"],
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": current_config["temperature"],
                        "top_p": current_config["top_p"]
                    }
                },
                timeout=60
            )
            
            if ollama_response.status_code == 200:
                data = ollama_response.json()
                response_text = data.get("response", "")
            else:
                error_count.labels(error_type="ollama_error").inc()
                raise HTTPException(status_code=500, detail="Ollama request failed")
        
        # Calculate metrics
        latency = time.time() - start_time
        tokens = len(response_text.split())
        tps = tokens / latency if latency > 0 else 0
        
        tokens_per_second.set(tps)
        request_latency.labels(method="POST", endpoint="/query").observe(latency)
        
        return {
            "response": response_text,
            "tokens": tokens,
            "latency": latency,
            "tokens_per_second": tps,
            "model_runner": model_runner
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
    {"name": "ollama-llm", "port": 18005, "url": "http://localhost:18005", "health_endpoint": "/api/tags", "internal_url": "http://ollama-llm:11434"},
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
        "port": service["port"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


