# Development Guide

This document covers key learnings, development patterns, best practices, and important considerations for working with AI Pen Knife.

## Key Learnings

### 1. Service Health Checks

**Challenge**: Services need to check their own health and the health of other services.

**Solution**: 
- Self-checks return healthy immediately (no network call)
- Other services checked via internal Docker hostnames
- External URLs used for user-facing links

**Code Pattern**:
```python
# Special handling for self-check
if service["name"] == "python-rag":
    return {"status": "healthy", ...}  # No network call

# Other services use internal URLs
check_url = service.get("internal_url", service["url"])
```

**Learning**: Self-health checks can cause timeouts if they try to connect to themselves. Always handle self-checks specially.

### 2. Port Management

**Challenge**: Multiple Docker projects can conflict on ports.

**Solution**: 
- Use port ranges (18000-18007) per project
- Document port allocation
- Use Docker labels for metadata

**Best Practice**:
```yaml
labels:
  - "com.ai-penknife.service=web-ui"
  - "com.ai-penknife.port=18000"
```

**Learning**: Port conflicts are common in local development. A clear strategy prevents issues.

### 3. Environment Variables in Next.js

**Challenge**: Next.js embeds `NEXT_PUBLIC_*` variables at build time.

**Solution**:
- Pass as build args in Dockerfile
- Use ARG and ENV in multi-stage build
- Default values in code for fallback

**Pattern**:
```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

**Learning**: Next.js environment variables are compile-time, not runtime. Plan accordingly.

### 4. Rust Prometheus Integration

**Challenge**: Prometheus Rust client API changed between versions.

**Solution**:
- Use `HistogramOpts` instead of `Opts` for histograms
- Use default registry with `prometheus::register()`
- Check version compatibility

**Pattern**:
```rust
let opts = HistogramOpts::new("metric_name", "help text");
let histogram = Histogram::with_opts(opts)?;
prometheus::register(Box::new(histogram.clone()))?;
```

**Learning**: Rust's type system catches API mismatches at compile time, but version compatibility matters.

### 5. Python Dependency Conflicts

**Challenge**: Deepchecks requires scipy <= 1.10.1, but newer versions available.

**Solution**:
- Pin compatible versions in requirements.txt
- Test dependency resolution
- Document version constraints

**Learning**: Python's dependency resolution can be tricky. Pin versions for production.

### 6. Async vs Sync in Python

**Challenge**: Mixing async FastAPI with sync requests library.

**Solution**:
- Use `concurrent.futures.ThreadPoolExecutor` for parallel sync calls
- Keep async endpoints async
- Use sync libraries in thread pool

**Pattern**:
```python
with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(check_service_health, SERVICES))
```

**Learning**: Thread pools bridge async and sync code effectively.

### 7. Docker Build Caching

**Challenge**: Slow rebuilds when code changes.

**Solution**:
- Order Dockerfile layers by change frequency
- Copy dependencies before code
- Use .dockerignore

**Pattern**:
```dockerfile
# Dependencies change rarely
COPY requirements.txt .
RUN pip install -r requirements.txt

# Code changes frequently
COPY . .
```

**Learning**: Docker layer caching significantly speeds up rebuilds.

### 8. Service Discovery

**Challenge**: Services need to find each other in Docker network.

**Solution**:
- Use service names as hostnames
- Internal ports (not exposed ports)
- Environment variables for configuration

**Pattern**:
```yaml
environment:
  - OLLAMA_URL=http://ollama-llm:11434  # Service name, not localhost
```

**Learning**: Docker Compose creates a DNS for service names. Use it!

## Development Patterns

### API Design

**RESTful Endpoints**:
- `GET /health` - Health checks
- `GET /models` - List resources
- `POST /config` - Update configuration
- `GET /metrics` - Monitoring data

**Error Handling**:
```python
try:
    result = do_operation()
    return {"status": "success", "data": result}
except SpecificError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal error")
```

### Type Safety

**TypeScript Interfaces**:
```typescript
interface Service {
  name: string
  port: number
  url: string
  status: string
  error?: string
}
```

**Python Type Hints**:
```python
from typing import List, Optional

def check_service_health(service: dict) -> dict:
    status: str = "unknown"
    error: Optional[str] = None
    # ...
```

### Component Structure

**React Components**:
- Separate data fetching from presentation
- Use custom hooks for reusable logic
- Type all props and state

**Pattern**:
```typescript
// Custom hook
const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  // ... fetch logic
  return { services, loading, error }
}

// Component
export default function Dashboard() {
  const { services, loading } = useServices()
  // ... render
}
```

## Best Practices

### 1. Logging

**Python**:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("Service started")
logger.error(f"Error: {e}", exc_info=True)
```

**Rust**:
```rust
use log::{info, error};
info!("Service started on port 8080");
error!("Failed to start: {}", e);
```

**Learning**: Structured logging makes debugging much easier. Include context.

### 2. Error Messages

**Good**:
```python
raise HTTPException(
    status_code=404,
    detail="Service 'python-rag' not found. Available: web-ui, rust-wasm-compute"
)
```

**Bad**:
```python
raise HTTPException(status_code=404, detail="Not found")
```

**Learning**: Helpful error messages save debugging time.

### 3. Configuration

**Environment Variables**:
- Use `.env` files for local development
- Document all variables
- Provide defaults
- Validate on startup

**Pattern**:
```python
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama-llm:11434")
if not OLLAMA_URL:
    raise ValueError("OLLAMA_URL must be set")
```

### 4. Testing

**Unit Tests**:
- Test business logic in isolation
- Mock external dependencies
- Test error cases

**Integration Tests**:
- Test service interactions
- Use test containers
- Verify API contracts

**Learning**: Start with integration tests for APIs, add unit tests for complex logic.

### 5. Documentation

**Code Comments**:
- Explain "why", not "what"
- Document complex algorithms
- Include examples

**API Documentation**:
- FastAPI auto-generates OpenAPI docs
- Add descriptions to endpoints
- Include example requests/responses

## Common Pitfalls

### 1. Port Conflicts

**Problem**: Service won't start, port already in use.

**Solution**:
```bash
# Check what's using the port
lsof -i :18001

# Change port in docker-compose.yaml
# Update all references
```

### 2. Network Issues

**Problem**: Services can't reach each other.

**Solution**:
- Verify services are on same network
- Use service names, not localhost
- Check internal vs external ports

### 3. Build Failures

**Problem**: Docker build fails with cryptic errors.

**Solution**:
- Check base image versions
- Verify dependency versions
- Look for version conflicts
- Check build logs carefully

### 4. Environment Variables

**Problem**: Variables not available in container.

**Solution**:
- Check docker-compose.yaml environment section
- Verify variable names match
- Use `docker compose config` to verify

### 5. Volume Permissions

**Problem**: Services can't write to volumes.

**Solution**:
- Check volume mount paths
- Verify permissions
- Use named volumes for persistence

## Performance Considerations

### 1. Python Performance

**Bottlenecks**:
- GIL limits true parallelism
- NumPy operations are fast (C under the hood)
- I/O-bound operations benefit from async

**Optimizations**:
- Use NumPy for array operations
- Async I/O for network calls
- Consider Rust for CPU-bound tasks

### 2. Rust Performance

**Strengths**:
- Zero-cost abstractions
- No garbage collector
- Excellent parallel processing

**Considerations**:
- Compile time can be slow
- Learning curve is steep
- Overkill for simple tasks

### 3. Database Performance

**Qdrant**:
- Index vectors for fast search
- Use appropriate distance metrics
- Filter before search when possible

**Pattern**:
```python
results = qdrant_client.search(
    collection_name="docs",
    query_vector=embedding,
    query_filter=Filter(...),  # Filter first
    limit=10
)
```

## Security Considerations

### 1. Network Isolation

- Services run in Docker network
- Only expose necessary ports
- Use internal hostnames

### 2. Input Validation

- Validate all inputs with Pydantic
- Sanitize user input
- Check file sizes/limits

### 3. Secrets Management

- Never commit secrets
- Use environment variables
- Consider Docker secrets for production

## Deployment Considerations

### 1. Kubernetes Readiness

- Health check endpoints implemented
- Metrics endpoints exposed
- Stateless service design
- ConfigMap/Secret support

### 2. Resource Limits

- Set memory limits
- Set CPU limits
- Monitor resource usage

### 3. Scaling

- Horizontal scaling ready
- Stateless services
- Shared state in databases

## Debugging Tips

### 1. Service Logs

```bash
# Follow logs
docker compose logs -f [service]

# Last 100 lines
docker compose logs --tail=100 [service]

# Specific time range
docker compose logs --since 10m [service]
```

### 2. Container Inspection

```bash
# Enter container
docker compose exec [service] sh

# Check environment
docker compose exec [service] env

# Check network
docker compose exec [service] ping [other-service]
```

### 3. API Testing

```bash
# Health check
curl http://localhost:18001/health

# With verbose output
curl -v http://localhost:18001/health

# POST request
curl -X POST http://localhost:18001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

## Future Improvements

1. **Testing**: Add comprehensive test suite
2. **CI/CD**: Automated testing and deployment
3. **Documentation**: API documentation site
4. **Monitoring**: More detailed metrics
5. **Security**: Authentication and authorization
6. **Performance**: Benchmarking suite
7. **Multi-model**: Support more LLM runtimes

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)

