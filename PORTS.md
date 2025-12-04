# Port Allocation Guide

This document tracks port usage for the AI Pen Knife project to avoid conflicts with other Docker projects.

## Port Range Strategy

We use ports in the **18000-18999** range to minimize conflicts with common services and other projects.

## Current Port Allocation

| Service | Port | Internal Port | URL |
|---------|------|---------------|-----|
| Web UI (Next.js) | 18000 | 3000 | http://localhost:18000 |
| Python RAG API | 18001 | 8000 | http://localhost:18001 |
| Rust Compute API | 18002 | 8080 | http://localhost:18002 |
| Qdrant HTTP | 18003 | 6333 | http://localhost:18003 |
| Qdrant gRPC | 18004 | 6334 | http://localhost:18004 |
| Docker Model Runner | N/A | N/A | Docker Desktop service |
| Prometheus | 18006 | 9090 | http://localhost:18006 |
| Grafana | 18007 | 3000 | http://localhost:18007 |
| DeepEval Service | 18008 | 8000 | http://localhost:18008 |
| Phoenix (Optional) | 18009 | 6006 | http://localhost:18009 |

## Best Practices for Multi-Project Docker

### 1. Use Port Ranges by Project
- **18000-18999**: AI Pen Knife
- **19000-19999**: Reserve for next project
- **17000-17999**: Reserve for another project

### 2. Document Port Usage
- Keep this file updated
- Add port ranges to project README
- Use labels in docker-compose.yaml

### 3. Docker Compose Labels
We use labels to track service metadata:
```yaml
labels:
  - "com.ai-penknife.service=web-ui"
  - "com.ai-penknife.port=18000"
```

### 4. Check Port Availability
Before starting services:
```bash
# Check if port is in use
lsof -i :18000

# Or using netstat
netstat -an | grep 18000
```

### 5. Environment Variables
Use environment variables for port configuration:
```bash
# .env file
WEB_UI_PORT=18000
API_PORT=18001
```

### 6. Port Conflicts Resolution
If a port is already in use:
1. Check what's using it: `lsof -i :PORT`
2. Either stop the conflicting service
3. Or update docker-compose.yaml with a new port
4. Update this document

## Future Port Allocation

When adding new services:
1. Check this document for available ports
2. Use the next available port in the range
3. Update this document
4. Update docker-compose.yaml
5. Update service definitions in code

## Port Management Script

You can create a simple script to check all ports:
```bash
#!/bin/bash
for port in 18000 18001 18002 18003 18004 18005 18006 18007; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "Port $port is in use"
  else
    echo "Port $port is available"
  fi
done
```

