# API Reference

Complete API documentation for all services in AI Pen Knife.

## Python RAG API

Base URL: `http://localhost:18001`

### Health & Status

#### GET /health

Check service health and dependencies.

**Response**:
```json
{
  "status": "healthy",
  "qdrant": "connected",
  "ollama": "connected"
}
```

#### GET /services

Get status of all platform services.

**Response**:
```json
{
  "services": [
    {
      "name": "web-ui",
      "port": 18000,
      "url": "http://localhost:18000",
      "status": "healthy",
      "error": null
    }
  ],
  "total": 7,
  "healthy": 6,
  "unhealthy": 1
}
```

#### GET /services/{service_name}

Get status of a specific service.

**Parameters**:
- `service_name` (path): Name of the service

**Response**:
```json
{
  "name": "python-rag",
  "port": 18001,
  "url": "http://localhost:18001",
  "status": "healthy",
  "error": null
}
```

### Model Management

#### GET /models

List available models from Ollama and local model runners.

**Response**:
```json
{
  "models": [
    {
      "name": "llama3.1:8b",
      "size": "8B",
      "runner": "ollama"
    },
    {
      "name": "my-local-model",
      "size": "local",
      "runner": "local",
      "url": "http://my-model-service:8000"
    }
  ]
}
```

#### GET /config

Get current model and test configuration.

**Response**:
```json
{
  "model": "llama3.1:8b",
  "model_runner": "ollama",
  "local_model_url": null,
  "temperature": 0.7,
  "top_p": 0.9,
  "bias_threshold": 0.1,
  "drift_sensitivity": 0.05
}
```

#### POST /config

Update model and test configuration.

**Request Body**:
```json
{
  "model": "llama3.1:8b",
  "model_runner": "ollama",
  "local_model_url": null,
  "temperature": 0.7,
  "top_p": 0.9,
  "bias_threshold": 0.1,
  "drift_sensitivity": 0.05
}
```

**Response**:
```json
{
  "message": "Configuration updated",
  "config": { ... }
}
```

### Query & RAG

#### POST /query

Execute a query with optional RAG.

**Request Body**:
```json
{
  "query": "What is artificial intelligence?",
  "use_rag": false
}
```

**Response**:
```json
{
  "response": "Artificial intelligence is...",
  "tokens": 150,
  "latency": 2.5,
  "tokens_per_second": 60.0,
  "model_runner": "ollama"
}
```

**Parameters**:
- `query` (string, required): The query text
- `use_rag` (boolean, optional): Whether to use RAG (default: true)

### Document Management

#### POST /documents

Ingest documents into the vector database.

**Request Body**:
```json
{
  "documents": [
    "Document 1 text...",
    "Document 2 text...",
    "Document 3 text..."
  ],
  "collection_name": "default"
}
```

**Response**:
```json
{
  "message": "Ingested 3 documents",
  "collection": "default"
}
```

**Parameters**:
- `documents` (array, required): List of document texts
- `collection_name` (string, optional): Collection name (default: "default")

### Metrics

#### GET /metrics

Get current performance metrics.

**Response**:
```json
{
  "tokensPerSecond": 60.5,
  "latency": 0.0,
  "errorRate": 0.0
}
```

#### GET /metrics/prometheus

Prometheus metrics endpoint.

**Response**: Prometheus text format

## Rust Compute API

Base URL: `http://localhost:18002`

### Health

#### GET /health

Check service health.

**Response**:
```json
{
  "status": "healthy",
  "service": "rust-wasm-compute"
}
```

### Compute Operations

#### POST /benchmark

Run performance benchmark.

**Request Body**:
```json
{
  "iterations": 1000
}
```

**Response**:
```json
{
  "result": "Completed 1000 iterations",
  "iterations": 1000,
  "duration_ms": 125.5,
  "throughput": 7.97
}
```

**Parameters**:
- `iterations` (integer, optional): Number of iterations (default: 1000)

#### POST /compute/math

Perform high-performance math operations.

**Request Body**:
```json
{
  "operation": "embedding",
  "data": [1.0, 2.0, 3.0, 4.0, 5.0]
}
```

**Response**:
```json
{
  "result": [0.54, -0.42, 0.99, ...],
  "duration_ms": 0.5
}
```

**Parameters**:
- `operation` (string, required): Operation type ("embedding", "multiply", "add")
- `data` (array, required): Input data array

### Metrics

#### GET /metrics

Prometheus metrics endpoint.

**Response**: Prometheus text format

## Ollama API

Base URL: `http://localhost:18005`

### Models

#### GET /api/tags

List available models.

**Response**:
```json
{
  "models": [
    {
      "name": "llama3.1:8b",
      "size": 4738,
      "digest": "...",
      "modified_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Generation

#### POST /api/generate

Generate text from a prompt.

**Request Body**:
```json
{
  "model": "llama3.1:8b",
  "prompt": "Hello, how are you?",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9
  }
}
```

**Response**:
```json
{
  "model": "llama3.1:8b",
  "created_at": "2024-01-01T00:00:00Z",
  "response": "I'm doing well, thank you!",
  "done": true,
  "context": [...],
  "total_duration": 2500000000,
  "load_duration": 1000000000,
  "prompt_eval_count": 5,
  "prompt_eval_duration": 500000000,
  "eval_count": 10,
  "eval_duration": 1000000000
}
```

## Qdrant API

Base URL: `http://localhost:18003`

### Health

#### GET /health

Check service health.

**Response**:
```json
{
  "title": "qdrant - vector search engine",
  "version": "1.7.0"
}
```

### Collections

#### GET /collections

List all collections.

**Response**:
```json
{
  "result": {
    "collections": [
      {
        "name": "default",
        "vectors_count": 1000,
        "indexed_vectors_count": 1000,
        "points_count": 1000,
        "segments_count": 1,
        "config": { ... }
      }
    ]
  },
  "status": "ok",
  "time": 0.0001
}
```

## Prometheus API

Base URL: `http://localhost:18006`

### Query

#### GET /api/v1/query

Query Prometheus metrics.

**Parameters**:
- `query` (string, required): PromQL query
- `time` (string, optional): Evaluation timestamp

**Example**:
```
GET /api/v1/query?query=python_rag_requests_total
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "method": "GET",
          "endpoint": "/health"
        },
        "value": [1234567890, "100"]
      }
    ]
  }
}
```

## Error Responses

All APIs return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid request
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production use.

## Authentication

Currently no authentication required. Add for production deployments.

## CORS

CORS is enabled for all origins in development. Restrict in production.

## Examples

### Query with RAG

```bash
curl -X POST http://localhost:18001/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is RAG?",
    "use_rag": true
  }'
```

### Ingest Documents

```bash
curl -X POST http://localhost:18001/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      "RAG stands for Retrieval Augmented Generation.",
      "It combines retrieval and generation for better results."
    ],
    "collection_name": "ai-knowledge"
  }'
```

### Run Benchmark

```bash
curl -X POST http://localhost:18002/benchmark \
  -H "Content-Type: application/json" \
  -d '{"iterations": 1000}'
```

### Check Service Status

```bash
curl http://localhost:18001/services
```

## OpenAPI Documentation

FastAPI automatically generates OpenAPI documentation:

- Swagger UI: `http://localhost:18001/docs`
- ReDoc: `http://localhost:18001/redoc`
- OpenAPI JSON: `http://localhost:18001/openapi.json`

