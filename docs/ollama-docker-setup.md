# Ollama Docker Setup Explained

## Where is Ollama?

Ollama runs **inside a Docker container** as part of the AI Pen Knife platform.

### Container Details

- **Service Name**: `ollama-llm`
- **Image**: `ollama/ollama:latest`
- **Internal Port**: `11434` (Ollama's default port)
- **External Port**: `18005` (mapped to host)
- **Network**: `ai-penknife-network` (Docker bridge network)
- **Volume**: `ollama_data` (persists models between restarts)

### How It Works

1. **Docker Container**: Ollama runs in an isolated Docker container
2. **Internal Access**: Services in the same Docker network access it via `http://ollama-llm:11434`
3. **External Access**: You can access it from your host machine at `http://localhost:18005`
4. **Model Storage**: Models are stored in a Docker volume, so they persist even if the container is recreated

### Network Architecture

```
┌─────────────────────────────────────┐
│  Docker Network: ai-penknife-network │
│                                       │
│  ┌──────────────┐                    │
│  │  python-rag  │                    │
│  │  Port 8000   │                    │
│  └──────┬───────┘                    │
│         │                            │
│         │ http://ollama-llm:11434    │
│         │                            │
│  ┌──────▼───────┐                    │
│  │ ollama-llm   │                    │
│  │ Port 11434   │                    │
│  └──────────────┘                    │
│                                       │
└─────────────────────────────────────┘
         │
         │ Port mapping: 18005:11434
         │
┌────────▼────────┐
│  Your Host      │
│  localhost:18005│
└─────────────────┘
```

### Accessing Ollama

**From inside Docker network** (other services):
```python
OLLAMA_URL = "http://ollama-llm:11434"  # Service name, internal port
```

**From your host machine**:
```bash
curl http://localhost:18005/api/tags
```

### Model Management

Models are stored in the Docker volume:
- **Volume Name**: `ollama_data`
- **Location in Container**: `/root/.ollama`
- **Persistence**: Models persist even if container is recreated

### Pulling Models

**From inside container**:
```bash
docker compose exec ollama-llm ollama pull llama3.1:8b
```

**From host** (via API):
```bash
curl http://localhost:18005/api/pull -d '{"name": "llama3.1:8b"}'
```

### Why Docker?

1. **Isolation**: Ollama runs in its own environment
2. **Portability**: Same setup works anywhere Docker runs
3. **Resource Management**: Docker can limit CPU/memory
4. **Networking**: Easy service-to-service communication
5. **Persistence**: Volumes keep models between restarts

### Current Setup

The `ollama-llm` service in `docker-compose.yaml`:
- Automatically starts Ollama server
- Optionally pulls models on startup (non-blocking)
- Exposes port 18005 for external access
- Connects to `ai-penknife-network` for internal access

### Integration with Platform

The Python RAG backend connects to Ollama via:
```python
OLLAMA_URL = "http://ollama-llm:11434"  # Docker service name
```

This allows:
- Service discovery via Docker DNS
- Internal network communication (faster, more secure)
- No need to expose Ollama externally (unless needed)

