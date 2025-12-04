# Evaluation Quick Start Guide

## Overview

This guide helps you quickly implement the evaluation stack for testing all 6 models and custom AI applications.

## Quick Implementation Order

### Step 1: Add Core Evaluation Metrics (30 min)

Add to `backend/python-rag/requirements.txt`:
```txt
ragas>=0.1.0
rouge-score>=0.1.2
bert-score>=0.3.13
nltk>=3.8.1
```

### Step 2: Create Evaluation Service (1 hour)

Create `services/evaluation/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 3: Add Evaluation Endpoints (2 hours)

Add to `backend/python-rag/main.py`:
- `/evaluate/ragas` - RAG quality scoring
- `/evaluate/bleu-rouge` - Text generation metrics
- `/evaluate/bertscore` - Semantic similarity
- `/evaluate/exact-match` - Fact-based QA
- `/metrics/ttft` - Time to first token
- `/metrics/tpot` - Time per output token
- `/metrics/tokens` - Token usage tracking

### Step 4: Enhance Speed Metrics (1 hour)

- Add streaming support for TTFT
- Track token count per response
- Add Vector DB query timing

### Step 5: Add Cost Tracking (1 hour)

- Token counting
- Cost calculation based on model
- Cost API endpoint

## Testing Workflow

### Test All 6 Models

```bash
curl -X POST http://localhost:18001/tests/run \
  -H "Content-Type: application/json" \
  -d '{
    "models": [
      "deepseek-r1-distill-llama",
      "gpt-oss",
      "llama3.1",
      "mistral",
      "qwen3-coder",
      "qwen3-vl"
    ],
    "prompt": "Explain quantum computing",
    "metrics": ["ragas", "bleu", "rouge", "ttft", "tpot"]
  }'
```

### Compare Models

```bash
curl http://localhost:18001/tests/compare?models=llama3.1,mistral
```

## Next: Full Implementation

See [evaluation-plan.md](./evaluation-plan.md) for complete implementation details.

