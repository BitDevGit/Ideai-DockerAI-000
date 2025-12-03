# Architecture Decisions

This document records the key architectural decisions made during the development of AI Pen Knife, including the rationale, alternatives considered, and trade-offs.

## ADR-001: Sovereign First Architecture

**Status**: Accepted

**Context**: The platform must operate entirely locally with no external API dependencies for core functionality.

**Decision**: All core components (LLM runtime, vector DB, compute, monitoring) run in Docker containers on the local machine.

**Rationale**:
- Ensures data privacy and control
- Works offline
- No vendor lock-in
- Predictable costs
- Full observability

**Alternatives Considered**:
- Cloud-hosted services (rejected: violates sovereign principle)
- Hybrid approach (rejected: adds complexity)

**Consequences**:
- Requires significant local resources (RAM, disk)
- Initial setup more complex
- Model downloads take time
- No automatic scaling

## ADR-002: Performance Hybridity (Python + Rust)

**Status**: Accepted

**Context**: Need both rapid development (Python ecosystem) and high performance (Rust speed).

**Decision**: Use Python for orchestration and ecosystem libraries, Rust for performance-critical compute operations.

**Rationale**:
- Python: Excellent ML/AI libraries (NumPy, Pandas, Deepchecks)
- Rust: 10-100x faster for mathematical operations
- Best of both worlds
- Clear separation of concerns

**Alternatives Considered**:
- Pure Python (rejected: too slow for compute)
- Pure Rust (rejected: ecosystem not mature enough)
- Go (rejected: less performance than Rust, smaller ML ecosystem)

**Consequences**:
- Two languages to maintain
- More complex build process
- Team needs both skills
- Clear performance wins

## ADR-003: Next.js for Frontend

**Status**: Accepted

**Context**: Need modern, performant dashboard with good developer experience.

**Decision**: Use Next.js 14 with TypeScript and Shadcn UI.

**Rationale**:
- Excellent performance (SSR, static generation)
- Great TypeScript support
- Rich ecosystem
- Production-ready
- Shadcn provides accessible components

**Alternatives Considered**:
- React + Vite (rejected: more setup, less optimization)
- Vue.js (rejected: smaller ecosystem)
- SvelteKit (rejected: less mature)

**Consequences**:
- Learning curve for Next.js concepts
- Build time can be slow
- Excellent developer experience
- Great performance out of the box

## ADR-004: Qdrant for Vector Database

**Status**: Accepted

**Context**: Need high-performance vector search for RAG pipeline.

**Decision**: Use Qdrant as the vector database.

**Rationale**:
- Written in Rust (fastest vector search)
- Excellent filtering capabilities
- Good documentation
- Active development
- REST and gRPC APIs

**Alternatives Considered**:
- Pinecone (rejected: cloud-only, not sovereign)
- Weaviate (rejected: more complex, Java-based)
- Milvus (rejected: more complex setup)
- Chroma (rejected: less mature, Python-based)

**Consequences**:
- Excellent performance
- Good feature set
- Requires Rust knowledge for advanced usage
- Active community

## ADR-005: Ollama for LLM Runtime

**Status**: Accepted

**Context**: Need local LLM execution with support for multiple models.

**Decision**: Use Ollama as the LLM runtime.

**Rationale**:
- Simple API
- Supports many models
- Optimized for local execution
- Active development
- Easy integration

**Alternatives Considered**:
- vLLM (rejected: more complex, GPU-focused)
- llama.cpp (rejected: lower-level, more setup)
- Hugging Face Transformers (rejected: Python-only, slower)

**Consequences**:
- Easy to use
- Good model support
- Resource intensive
- Model downloads can be large

## ADR-006: Prometheus + Grafana for Monitoring

**Status**: Accepted

**Context**: Need comprehensive observability for performance analysis.

**Decision**: Use Prometheus for metrics collection and Grafana for visualization.

**Rationale**:
- Industry standard
- Excellent integration
- Powerful query language
- Rich visualization
- Open source

**Alternatives Considered**:
- Datadog (rejected: cloud service, not sovereign)
- New Relic (rejected: cloud service, not sovereign)
- Custom solution (rejected: reinventing the wheel)

**Consequences**:
- Excellent observability
- Learning curve for PromQL
- Requires configuration
- Industry-standard solution

## ADR-007: Docker Compose for Orchestration

**Status**: Accepted

**Context**: Need to orchestrate multiple services locally.

**Decision**: Use Docker Compose for service orchestration.

**Rationale**:
- Simple and familiar
- Good for local development
- Easy networking
- Volume management
- Health checks

**Alternatives Considered**:
- Kubernetes (rejected: overkill for local dev)
- Docker Swarm (rejected: less common)
- Manual Docker commands (rejected: too complex)

**Consequences**:
- Easy local development
- Not production-ready (use K8s)
- Good for getting started
- Limited scaling options

## ADR-008: Port Range Strategy

**Status**: Accepted

**Context**: Multiple Docker projects can conflict on ports.

**Decision**: Use port range 18000-18007 for this project, document allocation.

**Rationale**:
- Avoids conflicts
- Easy to remember
- Scalable (can expand range)
- Documented in PORTS.md

**Alternatives Considered**:
- Random ports (rejected: hard to remember)
- Standard ports (rejected: conflicts likely)
- Environment variables (rejected: more complex)

**Consequences**:
- No port conflicts
- Easy to document
- Requires coordination for multiple projects
- Clear allocation strategy

## ADR-009: FastAPI for Python Backend

**Status**: Accepted

**Context**: Need fast, modern Python API framework.

**Decision**: Use FastAPI for the Python RAG backend.

**Rationale**:
- Very fast (comparable to Node.js)
- Automatic OpenAPI docs
- Type safety with Pydantic
- Async support
- Great documentation

**Alternatives Considered**:
- Flask (rejected: slower, no async)
- Django (rejected: too heavy, slower)
- Starlette (rejected: lower level)

**Consequences**:
- Excellent performance
- Automatic documentation
- Type safety
- Modern async support

## ADR-010: Actix-web for Rust Backend

**Status**: Accepted

**Context**: Need high-performance HTTP server in Rust.

**Decision**: Use Actix-web for the Rust compute service.

**Rationale**:
- One of the fastest web frameworks
- Excellent async support
- Type safe
- Good ecosystem

**Alternatives Considered**:
- Axum (rejected: newer, less mature)
- Warp (rejected: less popular)
- Rocket (rejected: less performant)

**Consequences**:
- Excellent performance
- Mature and stable
- Good async support
- Type safe

## ADR-011: Service Health Checks

**Status**: Accepted

**Context**: Need to monitor service health and status.

**Decision**: Implement health check endpoints on all services, self-checks return healthy immediately.

**Rationale**:
- Standard pattern
- Enables monitoring
- Self-checks avoid timeouts
- Simple to implement

**Alternatives Considered**:
- External health checks (rejected: more complex)
- No health checks (rejected: can't monitor)

**Consequences**:
- Good observability
- Simple implementation
- Works well with Prometheus

## ADR-012: Local Model Integration

**Status**: Accepted

**Context**: Users may have local models running in Docker.

**Decision**: Support local model integration via environment variables and model runner abstraction.

**Rationale**:
- Flexible
- Supports multiple model types
- Easy to configure
- Doesn't break existing functionality

**Alternatives Considered**:
- Ollama only (rejected: too limiting)
- Complex model registry (rejected: over-engineered)

**Consequences**:
- Flexible model support
- Easy to extend
- Requires configuration
- Supports multiple backends

## Trade-offs Summary

| Decision | Pros | Cons |
|----------|------|------|
| Sovereign First | Privacy, control, offline | Resource intensive |
| Python + Rust | Best of both worlds | Two languages |
| Next.js | Performance, DX | Learning curve |
| Qdrant | Fast, feature-rich | Rust knowledge helpful |
| Ollama | Simple, many models | Resource intensive |
| Prometheus/Grafana | Industry standard | Configuration needed |
| Docker Compose | Simple, familiar | Not production-ready |
| Port Ranges | No conflicts | Requires coordination |
| FastAPI | Fast, modern | Python ecosystem |
| Actix-web | Very fast | Rust learning curve |

## Future Considerations

1. **Kubernetes Migration**: Platform designed to be K8s-ready
2. **GPU Support**: Add GPU support for faster inference
3. **Multi-region**: Consider for distributed deployments
4. **Authentication**: Add auth for production use
5. **Rate Limiting**: Add for API protection
6. **Caching**: Add Redis for performance
7. **Message Queue**: Consider for async processing

## References

- [Architecture Decision Records](https://adr.github.io/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [12-Factor App](https://12factor.net/)

