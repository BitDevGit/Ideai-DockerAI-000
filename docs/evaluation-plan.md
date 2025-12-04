# Comprehensive Evaluation & Testing Plan

## Overview

This plan outlines how to transform AI Pen Knife into a lightweight, bloat-free platform for testing models and AI applications with comprehensive metrics and evaluation capabilities.

## Goals

1. **Model Comparison**: Test and compare all 6 Docker Model Runner models
2. **Custom App Testing**: Write and test custom AI applications and architectures
3. **Comprehensive Metrics**: Track all accuracy, speed, and cost metrics
4. **Lightweight**: Minimal bloat, maximum functionality
5. **Integrated Workflow**: Seamless testing from development to production

## Architecture

### Evaluation Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Evaluation Layer                      │
├─────────────────────────────────────────────────────────┤
│  DeepEval (Primary)  │  LM Eval Harness  │  Phoenix     │
│  - RAGAS              │  - Benchmarks     │  - Vectors   │
│  - Custom Metrics     │  - Standard Tests │  - Analysis  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Metrics Collection                     │
├─────────────────────────────────────────────────────────┤
│  Accuracy  │  Speed  │  Cost  │  Quality               │
│  - RAGAS   │  - TTFT │  - Tokens │  - BERTScore       │
│  - BLEU    │  - TPOT │  - Cost  │  - Exact Match      │
│  - ROUGE   │  - TPS  │  - Proxy │  - Faithfulness     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Testing Infrastructure                      │
├─────────────────────────────────────────────────────────┤
│  Pytest  │  Custom Scripts  │  CI/CD  │  Reports       │
└─────────────────────────────────────────────────────────┘
```

## Metrics Implementation Plan

### 1. Accuracy Metrics

#### RAGAS Score (Composite RAG Quality)
- **Tool**: `ragas` Python library
- **Metrics**:
  - Faithfulness: How grounded in context
  - Answer Relevancy: How relevant the answer
  - Context Precision: Precision of retrieved context
  - Context Recall: Recall of retrieved context
- **Integration**: Add to Python RAG backend
- **Endpoint**: `POST /evaluate/ragas`

#### BLEU/ROUGE (Text Generation)
- **Tool**: `nltk` or `rouge-score` library
- **Use Case**: Compare generated text to reference
- **Integration**: Add to evaluation service
- **Endpoint**: `POST /evaluate/bleu-rouge`

#### BERTScore (Semantic Similarity)
- **Tool**: `bert-score` library
- **Use Case**: Semantic similarity between generated and reference
- **Integration**: Add to evaluation service
- **Endpoint**: `POST /evaluate/bertscore`

#### Exact Match (EM) (Fact-based QA)
- **Tool**: Custom implementation
- **Use Case**: Exact string matching for factual answers
- **Integration**: Simple Python function
- **Endpoint**: `POST /evaluate/exact-match`

### 2. Speed Metrics

#### TTFT (Time To First Token)
- **Implementation**: Track time from request to first token
- **Location**: Python RAG backend (already tracking latency)
- **Enhancement**: Add streaming support to measure TTFT separately
- **Endpoint**: `GET /metrics/ttft`

#### TPOT (Time Per Output Token)
- **Implementation**: Total time / number of tokens
- **Location**: Python RAG backend
- **Enhancement**: Track token count per response
- **Endpoint**: `GET /metrics/tpot`

#### Throughput (Requests per Second)
- **Implementation**: Prometheus counter
- **Location**: Already implemented
- **Enhancement**: Add dedicated throughput endpoint
- **Endpoint**: `GET /metrics/throughput`

#### Vector DB Query Latency
- **Implementation**: Track Qdrant query times
- **Location**: Python RAG backend
- **Enhancement**: Add timing to vector search operations
- **Endpoint**: `GET /metrics/vector-latency`

### 3. Cost Metrics

#### Token Usage Tracking
- **Implementation**: Count input/output tokens
- **Location**: Python RAG backend
- **Storage**: Prometheus metrics + optional database
- **Endpoint**: `GET /metrics/tokens`

#### API Cost Simulation
- **Implementation**: Local proxy that tracks token usage
- **Model**: Calculate cost based on model pricing
- **Location**: New service or Python RAG enhancement
- **Endpoint**: `GET /metrics/cost`

## Service Architecture

### New Services to Add

1. **DeepEval Service** (Port 18008)
   - FastAPI service for evaluation
   - RAGAS, BLEU, ROUGE, BERTScore integration
   - Lightweight, focused on evaluation

2. **Phoenix Service** (Port 18009)
   - Vector analysis and visualization
   - Embedding quality analysis
   - Optional (can be added later)

3. **Evaluation API** (Part of Python RAG)
   - Unified evaluation endpoint
   - Orchestrates all evaluation tools
   - Returns comprehensive metrics

### Integration Points

```
┌──────────────┐
│  Frontend    │
│  Dashboard   │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────────────┐
│  Python RAG Backend                 │
│  - Evaluation Orchestration        │
│  - Metrics Collection               │
│  - Test Management                  │
└──────┬──────────────────────────────┘
       │
       ├──→ DeepEval Service (18008)
       ├──→ LM Eval Harness (CLI/API)
       ├──→ Phoenix (18009) [Optional]
       └──→ Custom Pytest Tests
```

## Implementation Phases

### Phase 1: Core Evaluation (Week 1)
- [ ] Add DeepEval service to docker-compose
- [ ] Integrate RAGAS scoring
- [ ] Add BLEU/ROUGE metrics
- [ ] Implement BERTScore
- [ ] Add Exact Match metric
- [ ] Create evaluation API endpoints

### Phase 2: Speed Metrics (Week 1-2)
- [ ] Enhance TTFT tracking (streaming support)
- [ ] Add TPOT calculation
- [ ] Improve throughput metrics
- [ ] Add Vector DB latency tracking
- [ ] Create speed metrics dashboard

### Phase 3: Cost & Token Tracking (Week 2)
- [ ] Implement token counting
- [ ] Add cost simulation
- [ ] Create cost tracking API
- [ ] Build cost visualization

### Phase 4: Advanced Testing (Week 2-3)
- [ ] Integrate LM Evaluation Harness
- [ ] Add Phoenix for vector analysis
- [ ] Create Pytest test framework
- [ ] Build test runner service
- [ ] Add test result storage

### Phase 5: Dashboard & Reporting (Week 3)
- [ ] Build evaluation dashboard UI
- [ ] Add comparison views
- [ ] Create test reports
- [ ] Add export functionality
- [ ] Integrate with Grafana

### Phase 6: CI/CD Integration (Week 4)
- [ ] Create GitHub Actions workflow
- [ ] Add automated test runs
- [ ] Generate evaluation reports
- [ ] Add test result artifacts

## Service Definitions

### DeepEval Service

```yaml
deepeval-service:
  build:
    context: ./services/deepeval
    dockerfile: Dockerfile
  ports:
    - "18008:8000"
  environment:
    - PYTHONUNBUFFERED=1
  networks:
    - ai-penknife-network
  depends_on:
    - python-rag
```

### Phoenix Service (Optional)

```yaml
phoenix-service:
  image: arizephoenix/phoenix:latest
  ports:
    - "18009:6006"
  networks:
    - ai-penknife-network
  volumes:
    - phoenix_data:/data
```

## API Endpoints

### Evaluation Endpoints

```
POST /evaluate/ragas
  Body: { query, context, answer, ground_truth }
  Returns: { faithfulness, relevancy, precision, recall, score }

POST /evaluate/bleu-rouge
  Body: { generated, reference }
  Returns: { bleu, rouge_l, rouge_1, rouge_2 }

POST /evaluate/bertscore
  Body: { generated, reference }
  Returns: { precision, recall, f1 }

POST /evaluate/exact-match
  Body: { generated, reference }
  Returns: { exact_match: bool, score: float }

POST /evaluate/comprehensive
  Body: { query, context, answer, ground_truth, model }
  Returns: { all_metrics }
```

### Metrics Endpoints

```
GET /metrics/ttft?model=<model>
GET /metrics/tpot?model=<model>
GET /metrics/throughput
GET /metrics/vector-latency
GET /metrics/tokens?model=<model>
GET /metrics/cost?model=<model>
```

### Test Endpoints

```
POST /tests/run
  Body: { test_suite, models: [...], config }
  Returns: { test_id, status }

GET /tests/{test_id}/results
GET /tests/compare?models=<model1,model2>
POST /tests/custom
  Body: { test_code, models, config }
```

## Testing Workflow

### 1. Model Comparison Test

```python
# Test all 6 models on same prompt
POST /tests/run
{
  "test_suite": "comparison",
  "models": [
    "deepseek-r1-distill-llama",
    "gpt-oss",
    "llama3.1",
    "mistral",
    "qwen3-coder",
    "qwen3-vl"
  ],
  "prompts": ["test prompt"],
  "metrics": ["ragas", "bleu", "rouge", "bertscore", "ttft", "tpot"]
}
```

### 2. Custom App Testing

```python
# Test custom application
POST /tests/custom
{
  "test_code": "...",
  "models": ["llama3.1"],
  "config": {...}
}
```

### 3. RAG Pipeline Testing

```python
# Test RAG with evaluation
POST /evaluate/ragas
{
  "query": "What is...",
  "context": [...retrieved docs...],
  "answer": "...",
  "ground_truth": "..."
}
```

## Dependencies

### Python Packages

```txt
# Evaluation
ragas>=0.1.0
rouge-score>=0.1.2
bert-score>=0.3.13
nltk>=3.8.1
sentence-transformers>=2.2.2

# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-benchmark>=4.0.0

# LM Evaluation Harness (optional)
lm-eval>=0.4.0
```

## File Structure

```
services/
  deepeval/
    Dockerfile
    requirements.txt
    main.py
    evaluators/
      ragas.py
      bleu_rouge.py
      bertscore.py
      exact_match.py

tests/
  unit/
  integration/
  benchmarks/
  custom/

evaluation/
  test_suites/
  metrics/
  reports/
```

## Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Start Phase 1** - Add DeepEval service and core metrics
3. **Iterate** - Build incrementally, test as we go
4. **Document** - Keep docs updated as we build

## Success Criteria

- ✅ All 6 models can be tested and compared
- ✅ All accuracy metrics available
- ✅ All speed metrics tracked
- ✅ Cost tracking functional
- ✅ Custom tests can be written and run
- ✅ Lightweight, no bloat
- ✅ CI/CD integration working
- ✅ Comprehensive reports generated

