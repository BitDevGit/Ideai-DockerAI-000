# AI Pen Knife - Step-by-Step User Guide

## 🚀 Getting Started

### Step 1: Start the Platform

```bash
# Navigate to the project directory
cd Ideai-DockerAI-000

# Start all services
docker compose up --build -d

# Check service status
docker compose ps
```

**Expected Output:** All 7 services should show "Up" status:
- web-ui (port 18000)
- python-rag (port 18001)
- rust-wasm-compute (port 18002)
- qdrant-db (port 18003)
- ollama-llm (port 18005)
- prometheus (port 18006)
- grafana (port 18007)

### Step 2: Access the Dashboard

1. **Open your browser** and navigate to: **http://localhost:18000**

2. You'll see the main dashboard with:
   - Model selector
   - Hyperparameter controls
   - Performance metrics
   - Quick links to services

3. **Click "Dashboard"** in the navigation bar (or go to http://localhost:18000/dashboard) to see:
   - Real-time service status
   - Health monitoring
   - Service links
   - Log viewer

### Step 3: Verify Services are Running

On the Dashboard page, you should see:
- ✅ **Green status** for healthy services
- Service names with their ports
- Click the external link icon to open services in new tabs

**If a service shows "timeout" or "down":**
```bash
# Check service logs
docker compose logs [service-name]

# Restart a specific service
docker compose restart [service-name]

# Example: Restart python-rag
docker compose restart python-rag
```

## 📊 Using the Platform

### Step 4: Configure Models

1. **On the main page** (http://localhost:18000):
   - Select a model from the dropdown (e.g., `llama3.1:8b` or `mistral:7b`)
   - Adjust **Temperature** (0-2): Controls randomness
   - Adjust **Top P** (0-1): Controls diversity
   - Click **"Apply Configuration"**

2. **Configure Deepchecks Parameters:**
   - **Bias Threshold** (0-1): Sensitivity for bias detection
   - **Drift Sensitivity** (0-0.5): Data drift detection threshold

### Step 5: Test LLM Queries

**Option A: Via API (using curl)**
```bash
# Simple query
curl -X POST http://localhost:18001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is artificial intelligence?", "use_rag": false}'

# Query with RAG
curl -X POST http://localhost:18001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain RAG", "use_rag": true}'
```

**Option B: Via Dashboard**
- Use the query interface (when implemented)
- Or use the API endpoints directly

### Step 6: Ingest Documents for RAG

```bash
# Add documents to the vector database
curl -X POST http://localhost:18001/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      "Artificial intelligence is the simulation of human intelligence by machines.",
      "RAG stands for Retrieval Augmented Generation.",
      "Vector databases store embeddings for semantic search."
    ],
    "collection_name": "ai-knowledge"
  }'
```

### Step 7: Run Performance Benchmarks

**Test Rust/Wasm Compute:**
```bash
# Run benchmark
curl -X POST http://localhost:18002/benchmark \
  -H "Content-Type: application/json" \
  -d '{"iterations": 1000}'

# Test math operations
curl -X POST http://localhost:18002/compute/math \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "embedding",
    "data": [1.0, 2.0, 3.0, 4.0, 5.0]
  }'
```

### Step 8: Monitor Performance

1. **View Metrics on Dashboard:**
   - Tokens per second
   - Latency
   - Error rate

2. **Open Grafana:**
   - Go to http://localhost:18007
   - Login: `admin` / `admin`
   - Create dashboards to visualize Prometheus metrics

3. **Open Prometheus:**
   - Go to http://localhost:18006
   - Query metrics like `python_rag_requests_total`
   - View service health

## 🔧 Working with Local Models

### Step 9: Connect Local Docker Models

If you have local models running in Docker:

#### Option A: Using Environment Variable (Recommended)

1. **Identify your model service:**
   ```bash
   # List running containers
   docker ps
   
   # Find your model service name and port
   # Example: my-model-service running on port 8000
   ```

2. **Set LOCAL_MODELS environment variable:**
   ```bash
   # Format: "name:url" or just "url"
   export LOCAL_MODELS="my-model:http://my-model-service:8000,another-model:http://another-service:9000"
   
   # Or create a .env file in the project root:
   echo "LOCAL_MODELS=my-model:http://my-model-service:8000" >> .env
   ```

3. **If your model service is in a different Docker network:**
   ```yaml
   # Add to docker-compose.yaml
   your-model-service:
     # ... your existing config
     networks:
       - ai-penknife-network  # Add to same network
   ```

4. **Restart python-rag service:**
   ```bash
   docker compose restart python-rag
   ```

#### Option B: Connect via Docker Network

1. **Add your model service to the same network:**
   ```yaml
   # In your model's docker-compose.yaml or when starting:
   networks:
     - ai-penknife-network
   ```

2. **Use internal Docker hostname:**
   ```bash
   # If your model service is named "my-model" in docker-compose
   export LOCAL_MODELS="my-model:http://my-model:8000"
   ```

3. **Restart:**
   ```bash
   docker compose restart python-rag
   ```

#### Using Local Models

1. **Check available models:**
   ```bash
   curl http://localhost:18001/models
   ```
   You should see both Ollama models and your local models listed.

2. **Configure to use local model:**
   ```bash
   curl -X POST http://localhost:18001/config \
     -H "Content-Type: application/json" \
     -d '{
       "model": "my-model",
       "model_runner": "local",
       "local_model_url": "http://my-model-service:8000",
       "temperature": 0.7,
       "top_p": 0.9,
       "bias_threshold": 0.1,
       "drift_sensitivity": 0.05
     }'
   ```

3. **Query using local model:**
   ```bash
   curl -X POST http://localhost:18001/query \
     -H "Content-Type: application/json" \
     -d '{"query": "Hello, how are you?", "use_rag": false}'
   ```

#### Supported Local Model APIs

The system supports two API formats:

1. **OpenAI-compatible API:**
   ```json
   POST /v1/chat/completions
   {
     "model": "default",
     "messages": [{"role": "user", "content": "prompt"}],
     "temperature": 0.7,
     "top_p": 0.9
   }
   ```

2. **Custom API:**
   ```json
   POST /generate
   {
     "prompt": "your prompt",
     "temperature": 0.7,
     "top_p": 0.9
   }
   ```

## 📝 Common Tasks

### View Service Logs

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f python-rag
docker compose logs -f rust-wasm-compute
docker compose logs -f web-ui
```

### Check Service Health

```bash
# Via API
curl http://localhost:18001/health

# Via dashboard
# Open http://localhost:18000/dashboard
```

### List Available Models

```bash
# Get models from Ollama
curl http://localhost:18001/models

# Or check Ollama directly
curl http://localhost:18005/api/tags
```

### Stop the Platform

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs [service-name]

# Rebuild specific service
docker compose build [service-name]
docker compose up -d [service-name]
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :18001

# Stop conflicting service or change port in docker-compose.yaml
```

### Models Not Loading

```bash
# Check Ollama logs
docker compose logs ollama-llm

# Manually pull models
docker compose exec ollama-llm ollama pull llama3.1:8b
docker compose exec ollama-llm ollama pull mistral:7b
```

### Dashboard Not Loading

1. Check web-ui logs: `docker compose logs web-ui`
2. Verify port 18000 is accessible
3. Check browser console for errors
4. Restart: `docker compose restart web-ui`

## 🎯 Next Steps

1. **Explore the Dashboard** - Get familiar with the interface
2. **Test Queries** - Try different models and parameters
3. **Ingest Documents** - Build your RAG knowledge base
4. **Monitor Performance** - Set up Grafana dashboards
5. **Integrate Local Models** - Connect your existing model services

## 📚 API Reference

### Python RAG API (Port 18001)

- `GET /health` - Service health check
- `GET /models` - List available models
- `GET /config` - Get current configuration
- `POST /config` - Update configuration
- `POST /query` - Execute query (with optional RAG)
- `POST /documents` - Ingest documents
- `GET /services` - List all services with status
- `GET /metrics` - Get performance metrics
- `GET /metrics/prometheus` - Prometheus metrics endpoint

### Rust Compute API (Port 18002)

- `GET /health` - Service health check
- `GET /metrics` - Prometheus metrics
- `POST /benchmark` - Run performance benchmark
- `POST /compute/math` - High-performance math operations

## 💡 Tips

- **Auto-refresh**: The dashboard auto-refreshes every 5 seconds
- **Service Links**: Click the external link icon to open services in new tabs
- **Logs**: Use the dashboard log viewer or terminal for detailed logs
- **Performance**: Monitor metrics in Grafana for production use
- **Models**: Ollama will auto-download models on first startup (may take 10-30 minutes)

---

**Need Help?** Check the logs, verify service health on the dashboard, or review the troubleshooting section above.

