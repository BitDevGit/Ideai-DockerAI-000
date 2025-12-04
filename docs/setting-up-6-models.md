# Setting Up Your 6 LLM Models

## Overview

AI Pen Knife uses **Ollama as the Docker Model Runner**. Ollama runs in a Docker container and manages all your LLM models. The model selector automatically discovers and displays all models from the Docker Ollama container.

## Current Status

Currently, 2 models are loaded:
- `llama3.1:8b` (4.9 GB)
- `mistral:7b` (4.4 GB)

## Adding Your 6 Models

### Step 1: Identify Your Models

List the 6 models you want to use. Common formats:
- `llama3.1:8b`
- `mistral:7b`
- `codellama:13b`
- `phi3:mini`
- `gemma:7b`
- `neural-chat:7b`

### Step 2: Update docker-compose.yaml

Edit `docker-compose.yaml` and update the `ollama-llm` service command section:

```yaml
command:
  - |
    ollama serve &
    sleep 10
    # Pull all 6 models in parallel (non-blocking)
    ollama pull llama3.1:8b || true &
    ollama pull mistral:7b || true &
    ollama pull your-model-3:tag || true &
    ollama pull your-model-4:tag || true &
    ollama pull your-model-5:tag || true &
    ollama pull your-model-6:tag || true &
    wait
```

Replace `your-model-3:tag` through `your-model-6:tag` with your actual model names.

### Step 3: Restart Ollama Service

```bash
# Restart to pull new models
docker compose up -d ollama-llm

# Watch the logs to see models downloading
docker compose logs -f ollama-llm
```

### Step 4: Verify Models are Loaded

```bash
# Check models in Docker Ollama
docker compose exec ollama-llm ollama list

# Or via API
curl http://localhost:18005/api/tags | python3 -m json.tool
```

### Step 5: Check Dashboard

Open http://localhost:18000 and check the model selector - all 6 models should appear!

## Alternative: Manual Model Pull

If you prefer to pull models manually:

```bash
# Enter the Ollama container
docker compose exec ollama-llm sh

# Pull each model
ollama pull model3:tag
ollama pull model4:tag
ollama pull model5:tag
ollama pull model6:tag

# Exit container
exit
```

## How It Works

1. **Ollama Docker Container**: Runs `ollama/ollama:latest` image
2. **Model Storage**: Models stored in Docker volume `ollama_data`
3. **Auto-Discovery**: Python RAG backend queries `http://ollama-llm:11434/api/tags`
4. **Model Selector**: Frontend displays all models from Docker Ollama

## Model Information

Each model will show:
- **Name**: Model identifier (e.g., `llama3.1:8b`)
- **Size**: Parameter count or file size
- **Source**: `docker` (from Docker Ollama container)
- **Format**: Usually `gguf` for Ollama models

## Troubleshooting

### Models Not Appearing

1. **Check Ollama is running**:
   ```bash
   docker compose ps ollama-llm
   ```

2. **Check models are loaded**:
   ```bash
   docker compose exec ollama-llm ollama list
   ```

3. **Check API access**:
   ```bash
   curl http://localhost:18005/api/tags
   ```

4. **Check Python RAG can reach Ollama**:
   ```bash
   docker compose exec python-rag curl http://ollama-llm:11434/api/tags
   ```

### Models Not Downloading

1. **Check disk space**:
   ```bash
   docker system df
   ```

2. **Check network**:
   ```bash
   docker compose exec ollama-llm ping 8.8.8.8
   ```

3. **Check logs**:
   ```bash
   docker compose logs ollama-llm | grep -i error
   ```

### Slow Downloads

- Models can be 4-70GB each
- Download time depends on internet speed
- Models download in parallel (non-blocking)
- Check progress in logs: `docker compose logs -f ollama-llm`

## Example: Complete Setup

Here's an example with 6 popular models:

```yaml
command:
  - |
    ollama serve &
    sleep 10
    ollama pull llama3.1:8b || true &
    ollama pull mistral:7b || true &
    ollama pull codellama:13b || true &
    ollama pull phi3:mini || true &
    ollama pull gemma:7b || true &
    ollama pull neural-chat:7b || true &
    wait
```

After restarting, all 6 models will be available in the model selector!

## Storage Considerations

- Each model: 4-70GB
- 6 models: ~24-420GB total
- Ensure sufficient disk space
- Models stored in Docker volume (persistent)

## Performance

- Models load on-demand when selected
- First query may be slower (model loading)
- Subsequent queries are faster
- Multiple models can be loaded simultaneously (if RAM allows)

## Summary

- **Ollama = Docker Model Runner**: All models run in Docker
- **Auto-Discovery**: Platform finds all models automatically
- **Persistent**: Models stored in Docker volume
- **Easy Management**: Pull models via docker-compose or manually
- **All 6 Models**: Will appear in model selector once loaded

The model selector will automatically show all models from your Docker Ollama container!

