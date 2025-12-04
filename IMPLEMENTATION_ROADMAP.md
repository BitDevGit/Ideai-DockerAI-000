# Implementation Roadmap

## Phase 1: Core Evaluation Metrics (Priority: High)

### Week 1 - Days 1-2: Setup & RAGAS

**Goal**: Get basic evaluation working

1. **Add Dependencies**
   ```bash
   # Add to backend/python-rag/requirements.txt
   ragas>=0.1.0
   rouge-score>=0.1.2
   ```

2. **Create Evaluation Module**
   - `backend/python-rag/evaluation/ragas_evaluator.py`
   - `backend/python-rag/evaluation/__init__.py`

3. **Add RAGAS Endpoint**
   ```python
   POST /evaluate/ragas
   {
     "query": "...",
     "context": [...],
     "answer": "...",
     "ground_truth": "..."
   }
   ```

4. **Test with One Model**
   - Test llama3.1 with RAGAS
   - Verify scores are reasonable

**Deliverable**: RAGAS scoring working for one model

---

### Week 1 - Days 3-4: BLEU/ROUGE & BERTScore

1. **Add BLEU/ROUGE**
   - `backend/python-rag/evaluation/bleu_rouge.py`
   - Endpoint: `POST /evaluate/bleu-rouge`

2. **Add BERTScore**
   - `backend/python-rag/evaluation/bertscore.py`
   - Endpoint: `POST /evaluate/bertscore`

3. **Add Exact Match**
   - Simple string matching
   - Endpoint: `POST /evaluate/exact-match`

**Deliverable**: All accuracy metrics available

---

### Week 1 - Day 5: Comprehensive Evaluation

1. **Create Unified Endpoint**
   ```python
   POST /evaluate/comprehensive
   {
     "query": "...",
     "context": [...],
     "answer": "...",
     "ground_truth": "...",
     "model": "llama3.1"
   }
   ```

2. **Return All Metrics**
   - RAGAS (faithfulness, relevancy, etc.)
   - BLEU/ROUGE
   - BERTScore
   - Exact Match

**Deliverable**: Single endpoint returns all accuracy metrics

---

## Phase 2: Speed Metrics (Priority: High)

### Week 2 - Days 1-2: TTFT & TPOT

1. **Add Streaming Support**
   - Modify query endpoint to support streaming
   - Track first token time separately

2. **TTFT Tracking**
   - Measure time to first token
   - Store in Prometheus
   - Endpoint: `GET /metrics/ttft?model=llama3.1`

3. **TPOT Calculation**
   - Track total tokens generated
   - Calculate time per token
   - Endpoint: `GET /metrics/tpot?model=llama3.1`

**Deliverable**: TTFT and TPOT metrics available

---

### Week 2 - Days 3-4: Throughput & Vector Latency

1. **Throughput Enhancement**
   - Improve existing Prometheus metrics
   - Add dedicated endpoint
   - Track requests per second per model

2. **Vector DB Latency**
   - Add timing to Qdrant queries
   - Track search latency
   - Endpoint: `GET /metrics/vector-latency`

**Deliverable**: All speed metrics tracked

---

## Phase 3: Cost & Token Tracking (Priority: Medium)

### Week 2 - Day 5: Token Counting

1. **Token Counting**
   - Count input tokens
   - Count output tokens
   - Store in Prometheus
   - Endpoint: `GET /metrics/tokens?model=llama3.1`

2. **Cost Simulation**
   - Define model pricing (or use estimates)
   - Calculate cost per request
   - Endpoint: `GET /metrics/cost?model=llama3.1`

**Deliverable**: Token and cost tracking working

---

## Phase 4: Model Comparison (Priority: High)

### Week 3 - Days 1-2: Test Runner

1. **Create Test Runner**
   - `backend/python-rag/testing/test_runner.py`
   - Run same prompt on multiple models
   - Collect all metrics

2. **Comparison Endpoint**
   ```python
   POST /tests/run
   {
     "models": ["llama3.1", "mistral", "gpt-oss"],
     "prompt": "...",
     "ground_truth": "...",
     "metrics": ["ragas", "bleu", "rouge", "ttft", "tpot"]
   }
   ```

3. **Comparison Results**
   - Side-by-side metrics
   - Endpoint: `GET /tests/compare?models=llama3.1,mistral`

**Deliverable**: Can compare all 6 models

---

### Week 3 - Days 3-4: DeepEval Service

1. **Create DeepEval Service**
   - `services/deepeval/Dockerfile`
   - `services/deepeval/main.py`
   - Add to docker-compose.yaml (port 18008)

2. **Integrate DeepEval**
   - Use DeepEval for additional metrics
   - Integrate with existing evaluation

**Deliverable**: DeepEval service running

---

## Phase 5: Custom Testing (Priority: Medium)

### Week 3 - Day 5: Custom Test Framework

1. **Pytest Integration**
   - Create test directory structure
   - Add pytest to requirements
   - Create test runner

2. **Custom Test Endpoint**
   ```python
   POST /tests/custom
   {
     "test_code": "...",
     "models": ["llama3.1"],
     "config": {...}
   }
   ```

**Deliverable**: Can run custom tests

---

## Phase 6: Dashboard & UI (Priority: Medium)

### Week 4 - Days 1-3: Evaluation Dashboard

1. **Add Evaluation Tab**
   - New page: `/evaluation`
   - Model comparison view
   - Metrics visualization

2. **Test Results View**
   - Show test results
   - Compare models
   - Export reports

**Deliverable**: Evaluation dashboard in UI

---

## Phase 7: Advanced Features (Priority: Low)

### Week 4 - Days 4-5: Phoenix & LM Eval Harness

1. **Phoenix Integration** (Optional)
   - Add Phoenix service
   - Vector analysis
   - Embedding visualization

2. **LM Evaluation Harness** (Optional)
   - Integrate for standard benchmarks
   - Run standard test suites

**Deliverable**: Advanced analysis tools available

---

## Phase 8: CI/CD (Priority: Low)

### Week 5: GitHub Actions

1. **Create Workflow**
   - `.github/workflows/evaluation.yml`
   - Run tests on PR
   - Generate reports

2. **Report Generation**
   - Export test results
   - Create artifacts
   - Post to PR

**Deliverable**: Automated testing in CI/CD

---

## Quick Wins (Do First)

1. ✅ Add RAGAS scoring (2 hours)
2. ✅ Add BLEU/ROUGE (1 hour)
3. ✅ Enhance TTFT tracking (1 hour)
4. ✅ Add token counting (1 hour)
5. ✅ Create comparison endpoint (2 hours)

**Total**: ~7 hours for basic evaluation

---

## Success Metrics

- [ ] All 6 models can be tested
- [ ] All accuracy metrics working
- [ ] All speed metrics tracked
- [ ] Cost tracking functional
- [ ] Model comparison working
- [ ] Custom tests can be written
- [ ] Dashboard shows results
- [ ] CI/CD integration complete

---

## Next Steps

1. **Review this roadmap** - Adjust priorities as needed
2. **Start Phase 1** - Get RAGAS working first
3. **Iterate quickly** - Build, test, improve
4. **Keep it lightweight** - No bloat, just what's needed

