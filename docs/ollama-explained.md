# Ollama Explained - Docker Model Runner

## Quick Answer

**Ollama IS the Docker Model Runner**. It runs in a Docker container and manages all your LLM models.

## Where is Ollama?

### Docker Container

Ollama runs as a Docker container:
- **Container Name**: `ollama-llm` 
- **Image**: `ollama/ollama:latest`
- **Location**: Inside Docker, on the `ai-penknife-network`

### Network Access

**Internal (Docker Network)**:
- Other services access: `http://ollama-llm:11434`
- Fast, secure, internal communication
- Used by Python RAG backend

**External (Your Host)**:
- You can access: `http://localhost:18005`
- Port mapping: `18005:11434` (host:container)

### Storage

Models are stored in a Docker volume:
- **Volume Name**: `ollama_data`
- **Persistent**: Models survive container restarts
- **Location**: `/root/.ollama` inside container

## How It Works

```
┌─────────────────────────────────────┐
│  Docker Network: ai-penknife-network│
│                                       │
│  ┌──────────────┐                    │
│  │  python-rag  │                    │
│  │              │                    │
│  └──────┬───────┘                    │
│         │                            │
│         │ Queries:                   │
│         │ http://ollama-llm:11434    │
│         │                            │
│  ┌──────▼──────────────┐            │
│  │  ollama-llm         │            │
│  │  (Docker Container) │            │
│  │  Port 11434         │            │
│  │                      │            │
│  │  Models:             │            │
│  │  - llama3.1:8b       │            │
│  │  - mistral:7b        │            │
│  │  - model3            │            │
│  │  - model4            │            │
│  │  - model5            │            │
│  │  - model6            │            │
│  └──────────────────────┘            │
│                                       │
└───────────────────────────────────────┘
         │
         │ Port 18005 (external access)
         │
    Your Host Machine
```

## Model Selector Flow

1. **Frontend** calls: `GET http://localhost:18001/models`
2. **Python RAG** queries: `GET http://ollama-llm:11434/api/tags`
3. **Ollama (Docker)** returns: List of all 6 models
4. **Python RAG** formats and returns to frontend
5. **Frontend** displays all 6 models in selector

## Adding Your 6 Models

### Current Setup (2 models)

Currently loaded:
- `llama3.1:8b`
- `mistral:7b`

### Add 4 More Models

1. **Edit `docker-compose.yaml`**:
   ```yaml
   command:
     - |
       ollama serve &
       sleep 10
       ollama pull llama3.1:8b || true &
       ollama pull mistral:7b || true &
       ollama pull model3:tag || true &  # Your 3rd model
       ollama pull model4:tag || true &  # Your 4th model
       ollama pull model5:tag || true &  # Your 5th model
       ollama pull model6:tag || true &  # Your 6th model
       wait
   ```

2. **Restart Ollama**:
   ```bash
   docker compose up -d ollama-llm
   ```

3. **Verify**:
   ```bash
   docker compose exec ollama-llm ollama list
   ```

4. **Check Dashboard**: All 6 models will appear automatically!

## Key Points

✅ **Ollama = Docker Model Runner**: It's the Docker container that runs all models

✅ **All Models in Docker**: Your 6 LLMs all run inside the Ollama Docker container

✅ **Auto-Discovery**: Platform automatically finds all models from Docker Ollama

✅ **No External Services**: Everything runs locally in Docker

✅ **Persistent Storage**: Models stored in Docker volume, survive restarts

## Verification

Check models are from Docker:
```bash
# List models in Docker Ollama
docker compose exec ollama-llm ollama list

# Check via API (from Docker)
curl http://localhost:18005/api/tags

# Check via Python RAG (internal)
curl http://localhost:18001/models
```

All should show the same 6 models from Docker!

## Summary

- **Ollama runs in Docker** as the `ollama-llm` container
- **All 6 models** run inside this Docker container
- **Model selector** automatically shows all models from Docker
- **No external services** - everything is local and sovereign
- **Persistent** - models stored in Docker volume

The model selector shows models from the Docker Ollama container - that's your Docker Model Runner!

