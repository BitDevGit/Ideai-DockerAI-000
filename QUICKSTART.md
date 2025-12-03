# Quick Start Guide

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 16GB+ RAM recommended
- 50GB+ free disk space
- Internet connection (for initial model downloads)

## First Time Setup

1. **Start the platform:**
   ```bash
   ./start.sh
   # OR
   docker compose up --build
   ```

2. **Wait for services to start** (2-5 minutes for first build)

3. **Wait for models to download** (10-30 minutes):
   - Check Ollama logs: `docker compose logs -f ollama-llm`
   - Models will be downloaded automatically: `llama3.1:8b` and `mistral:7b`

4. **Access the dashboard:**
   - Open http://localhost:3000 in your browser

## Manual Model Download (if needed)

If models don't download automatically:

```bash
# Enter the Ollama container
docker compose exec ollama-llm sh

# Pull models manually
ollama pull llama3.1:8b
ollama pull mistral:7b
```

## Common Commands

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f python-rag
docker compose logs -f rust-wasm-compute
docker compose logs -f web-ui

# Restart a service
docker compose restart python-rag

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
lsof -i :3000  # or :8000, :8080, etc.

# Stop conflicting services or change ports in docker-compose.yaml
```

### Out of Memory
- Increase Docker Desktop memory allocation (Settings → Resources)
- Close other applications
- Consider using smaller models

### Models Not Loading
- Check disk space: `df -h`
- Check Ollama logs: `docker compose logs ollama-llm`
- Manually pull models (see above)

### Frontend Not Connecting to Backend
- Verify services are running: `docker compose ps`
- Check network connectivity: `docker compose exec web-ui ping python-rag`
- Verify environment variables in docker-compose.yaml

## Service Health Checks

```bash
# Python RAG
curl http://localhost:8000/health

# Rust Compute
curl http://localhost:8080/health

# Prometheus
curl http://localhost:9090/-/healthy

# Qdrant
curl http://localhost:6333/health
```

## Next Steps

1. **Configure Grafana:**
   - Navigate to http://localhost:3001
   - Login with `admin`/`admin`
   - Change password when prompted
   - Prometheus datasource is pre-configured

2. **Test the Platform:**
   - Select a model in the dashboard
   - Adjust hyperparameters
   - Run a benchmark
   - View metrics in Grafana

3. **Ingest Documents:**
   - Use the Python RAG API to add documents
   - Test RAG queries through the dashboard

## Architecture Overview

```
┌─────────────┐
│   Web UI    │ (Next.js/Shadcn UI)
│  Port 3000  │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
│ Python RAG  │ │  Rust    │ │   Ollama    │
│  Port 8000  │ │ Compute  │ │  Port 11434 │
└──────┬──────┘ │ Port 8080 │ └─────────────┘
       │        └───────────┘
       │
┌──────▼──────┐
│   Qdrant    │
│  Port 6333  │
└─────────────┘

┌─────────────┐  ┌─────────────┐
│ Prometheus  │  │   Grafana   │
│ Port 9090   │  │  Port 3001  │
└─────────────┘  └─────────────┘
```


