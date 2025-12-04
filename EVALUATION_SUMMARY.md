# Evaluation & Testing Plan Summary

## What We're Building

A **lightweight, bloat-free** evaluation platform to test all 6 Docker Model Runner models and custom AI applications.

## Key Capabilities

### ✅ Model Testing
- Test all 6 models: `deepseek-r1-distill-llama`, `gpt-oss`, `llama3.1`, `mistral`, `qwen3-coder`, `qwen3-vl`
- Compare models side-by-side
- Run custom tests on any model

### ✅ Accuracy Metrics
- **RAGAS Score**: Composite RAG quality (faithfulness, relevancy, precision, recall)
- **BLEU/ROUGE**: Text generation quality
- **BERTScore**: Semantic similarity
- **Exact Match**: Fact-based QA accuracy

### ✅ Speed Metrics
- **TTFT**: Time To First Token
- **TPOT**: Time Per Output Token
- **Throughput**: Requests per second
- **Vector DB Latency**: Retrieval speed

### ✅ Cost Metrics
- **Token Usage**: Input/output token tracking
- **Cost Simulation**: Local proxy for cost estimation

## Implementation Stack

### Primary Tools
- **DeepEval**: Primary evaluation framework
- **RAGAS**: RAG quality scoring
- **LM Evaluation Harness**: Standard benchmarks
- **Phoenix**: Vector analysis (optional)

### Testing Framework
- **Pytest**: Custom test execution
- **Custom Scripts**: Write your own tests
- **CI/CD**: GitHub Actions integration

## Quick Start

### Phase 1: Core Metrics (Week 1)
1. Add RAGAS scoring
2. Add BLEU/ROUGE
3. Add BERTScore
4. Add Exact Match
5. Create unified evaluation endpoint

### Phase 2: Speed Metrics (Week 2)
1. Enhance TTFT tracking
2. Add TPOT calculation
3. Improve throughput metrics
4. Add Vector DB latency

### Phase 3: Cost Tracking (Week 2)
1. Token counting
2. Cost simulation

### Phase 4: Model Comparison (Week 3)
1. Test runner for all models
2. Comparison endpoints
3. DeepEval service integration

## Documentation

- **[Full Plan](./docs/evaluation-plan.md)**: Complete architecture and design
- **[Quick Start](./docs/evaluation-quickstart.md)**: Get started quickly
- **[Roadmap](./IMPLEMENTATION_ROADMAP.md)**: Step-by-step implementation guide

## Next Steps

1. **Review the plan** in `docs/evaluation-plan.md`
2. **Check the roadmap** in `IMPLEMENTATION_ROADMAP.md`
3. **Start with Phase 1** - Add RAGAS scoring (quick win!)
4. **Iterate** - Build incrementally, test as you go

## Success Criteria

- ✅ All 6 models testable and comparable
- ✅ All accuracy metrics available
- ✅ All speed metrics tracked
- ✅ Cost tracking functional
- ✅ Custom tests can be written
- ✅ Lightweight, no bloat
- ✅ CI/CD integration working

---

**Ready to start?** See `IMPLEMENTATION_ROADMAP.md` for detailed steps!

