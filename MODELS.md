# Model Configuration Guide

## Docker Model Runner: Ollama

**Ollama is the Docker Model Runner** for AI Pen Knife. It runs as a Docker container and manages all your LLM models.

### Where is Ollama?

- **Runs in**: Docker container (`ollama-llm`)
- **Docker Image**: `ollama/ollama:latest`
- **Internal Port**: `11434` (for Docker network communication)
- **External Port**: `18005` (accessible from your host)
- **Network**: `ai-penknife-network` (Docker bridge network)
- **Storage**: Docker volume `ollama_data` (models persist here)

### How Models are Discovered

1. **Python RAG Backend** queries: `http://ollama-llm:11434/api/tags`
2. **Ollama (Docker)** returns list of all models in the container
3. **Frontend** displays all models in the selector
4. **All models come from Docker** - no external services

## Setting Up Your 6 Models

### Current Models (2 loaded)

1. `llama3.1:8b` - 4.9 GB
2. `mistral:7b` - 4.4 GB

### Adding 4 More Models

Edit `docker-compose.yaml` and update the `ollama-llm` service:

```yaml
command:
  - |
    ollama serve &
    sleep 10
    # Your 6 models
    ollama pull llama3.1:8b || true &
    ollama pull mistral:7b || true &
    ollama pull model3:tag || true &  # Replace with your model
    ollama pull model4:tag || true &  # Replace with your model
    ollama pull model5:tag || true &  # Replace with your model
    ollama pull model6:tag || true &  # Replace with your model
    wait
```

Then restart:
```bash
docker compose up -d ollama-llm
```

### Verify All 6 Models

```bash
# Check models in Docker
docker compose exec ollama-llm ollama list

# Should show all 6 models
```

### Check in Dashboard

Open http://localhost:18000 - the model selector should show all 6 models from Docker!

## Quick Reference

- **Model Runner**: Ollama (Docker container)
- **Model Storage**: Docker volume `ollama_data`
- **Model Discovery**: Automatic via Ollama API
- **Model Access**: All models accessible via Docker network
- **External Access**: `http://localhost:18005` (if needed)

See [docs/setting-up-6-models.md](docs/setting-up-6-models.md) for detailed instructions.

