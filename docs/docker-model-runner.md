# Docker Model Runner - Using Ollama

## Overview

**Ollama is the Docker Model Runner** for AI Pen Knife. It runs as a Docker container and manages all your LLM models.

## Where is Ollama?

Ollama runs **inside a Docker container**:

- **Container Name**: `ollama-llm` (or `ideai-dockerai-000-ollama-llm-1`)
- **Docker Image**: `ollama/ollama:latest`
- **Internal Port**: `11434` (Ollama's default)
- **External Port**: `18005` (accessible from your host)
- **Network**: `ai-penknife-network` (Docker bridge network)
- **Storage**: Docker volume `ollama_data` (models persist here)

## How Models Work

### Model Storage

Models are stored in a Docker volume:
- **Volume Name**: `ollama_data`
- **Location**: `/root/.ollama` inside the container
- **Persistence**: Models survive container restarts and recreations

### Current Models

Currently loaded in Docker Ollama:
1. `llama3.1:8b` - 4.9 GB
2. `mistral:7b` - 4.4 GB

### Adding Your 6 Models

To use all 6 LLMs, you have two options:

#### Option 1: Auto-pull on Startup (Recommended)

Edit `docker-compose.yaml` and add your models to the command section:

```yaml
command:
  - |
    ollama serve &
    sleep 10
    ollama pull llama3.1:8b || true &
    ollama pull mistral:7b || true &
    ollama pull your-model-3:tag || true &
    ollama pull your-model-4:tag || true &
    ollama pull your-model-5:tag || true &
    ollama pull your-model-6:tag || true &
    wait
```

Then restart:
```bash
docker compose up -d ollama-llm
```

#### Option 2: Manual Pull

Pull models manually after container starts:

```bash
# Enter the Ollama container
docker compose exec ollama-llm sh

# Pull your models
ollama pull model3:tag
ollama pull model4:tag
ollama pull model5:tag
ollama pull model6:tag

# Or from host
docker compose exec ollama-llm ollama pull model3:tag
```

## How the Platform Uses Ollama

### Service Communication

```
┌─────────────────┐
│  python-rag     │
│  (FastAPI)      │
└────────┬────────┘
         │
         │ http://ollama-llm:11434
         │ (Docker internal network)
         │
┌────────▼────────┐
│  ollama-llm     │
│  (Docker)       │
│  Port 11434     │
└─────────────────┘
```

The Python RAG backend connects to Ollama using:
```python
OLLAMA_URL = "http://ollama-llm:11434"  # Docker service name
```

### Model Discovery

The `/models` endpoint:
1. Queries Ollama's API: `GET http://ollama-llm:11434/api/tags`
2. Gets list of all models in the Docker container
3. Returns them to the frontend
4. Frontend displays them in the model selector

### Querying Models

When you query a model:
1. Frontend sends request to Python RAG API
2. Python RAG calls Ollama: `POST http://ollama-llm:11434/api/generate`
3. Ollama (in Docker) runs the model
4. Response returns through the chain

## Managing Models

### List Models

```bash
# From host
curl http://localhost:18005/api/tags

# Or inside container
docker compose exec ollama-llm ollama list
```

### Pull New Models

```bash
# From host (via API)
curl http://localhost:18005/api/pull -d '{"name": "model-name:tag"}'

# Or inside container
docker compose exec ollama-llm ollama pull model-name:tag
```

### Remove Models

```bash
docker compose exec ollama-llm ollama rm model-name:tag
```

### Check Model Info

```bash
docker compose exec ollama-llm ollama show model-name:tag
```

## Network Architecture

### Internal (Docker Network)

Services communicate via Docker's internal DNS:
- `http://ollama-llm:11434` - Service name resolution
- Fast, secure, no external exposure needed

### External (Host Access)

You can access Ollama from your host:
- `http://localhost:18005` - Port mapping from container

## Why Docker for Models?

1. **Isolation**: Models don't interfere with host system
2. **Portability**: Same setup works anywhere
3. **Resource Control**: Docker can limit CPU/memory per model
4. **Persistence**: Volume storage keeps models between restarts
5. **Networking**: Easy service-to-service communication
6. **Scalability**: Can run multiple Ollama instances if needed

## Configuration

### Environment Variables

```yaml
environment:
  - OLLAMA_HOST=0.0.0.0  # Listen on all interfaces
```

### Volume Mount

```yaml
volumes:
  - ollama_data:/root/.ollama  # Persistent model storage
```

### Port Mapping

```yaml
ports:
  - "18005:11434"  # Host:Container
```

## Troubleshooting

### Models Not Showing

1. Check if Ollama is running:
   ```bash
   docker compose ps ollama-llm
   ```

2. Check Ollama logs:
   ```bash
   docker compose logs ollama-llm
   ```

3. Verify models are loaded:
   ```bash
   docker compose exec ollama-llm ollama list
   ```

4. Test API access:
   ```bash
   curl http://localhost:18005/api/tags
   ```

### Models Not Downloading

1. Check disk space:
   ```bash
   docker system df
   ```

2. Check network connectivity:
   ```bash
   docker compose exec ollama-llm ping 8.8.8.8
   ```

3. Check Ollama logs for errors:
   ```bash
   docker compose logs ollama-llm | grep -i error
   ```

### Performance Issues

1. Increase Docker memory allocation
2. Use GPU if available (requires GPU-enabled Ollama image)
3. Monitor resource usage:
   ```bash
   docker stats ollama-llm
   ```

## Best Practices

1. **Pre-pull Models**: Add models to docker-compose.yaml for automatic setup
2. **Monitor Storage**: Models can be large (4-70GB each)
3. **Use Volumes**: Always use named volumes for persistence
4. **Network Isolation**: Keep Ollama on internal network unless needed externally
5. **Resource Limits**: Set memory limits for production

## Summary

- **Ollama = Docker Model Runner**: It's the Docker container that runs all your LLMs
- **Models in Docker**: All 6 models run inside the Ollama Docker container
- **Persistent Storage**: Models stored in Docker volume
- **Network Access**: Internal (Docker network) and external (port 18005)
- **Auto-discovery**: Platform automatically finds all models in Ollama

The model selector shows all models from the Docker Ollama container - no external services needed!

