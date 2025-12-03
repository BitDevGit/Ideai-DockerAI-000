# AI Pen Knife - Sovereign AI Test Platform

A high-performance, containerized, all-in-one platform for testing and evaluating LLM/SLM performance, accountability, and RAG capabilities. Built with a "Sovereign First" architecture - all components run locally with no external API dependencies.

## 🎯 Project Overview

**AI Pen Knife** is a comprehensive testing and evaluation platform that enables:

- **Performance Benchmarking**: Test LLM/SLM throughput, latency, and resource usage
- **RAG Pipeline Testing**: Evaluate Retrieval Augmented Generation with vector databases
- **Model Accountability**: Integrate Deepchecks for bias detection and data drift monitoring
- **Hybrid Compute**: Leverage Python's ecosystem with Rust's performance for critical operations
- **Full Observability**: Prometheus metrics and Grafana dashboards for comprehensive monitoring

## 🏗️ Architecture

### Core Principles

1. **Sovereign First**: All components run locally in Docker - no external API dependencies
2. **Performance Hybridity**: Python for ecosystem, Rust/Wasm for speed-critical operations
3. **Standardization**: Kubernetes-ready, containerized architecture
4. **Full Observability**: Integrated monitoring with Prometheus and Grafana

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 14 + TypeScript + Shadcn UI | Modern, responsive dashboard |
| **RAG Backend** | FastAPI + Python 3.11 | RAG orchestration, Deepchecks integration |
| **Compute Engine** | Rust + Actix + WebAssembly | High-performance mathematical operations |
| **Vector DB** | Qdrant | Document embedding storage and retrieval |
| **LLM Runtime** | Ollama | Local model execution (Llama, Mistral, etc.) |
| **Monitoring** | Prometheus + Grafana | Metrics collection and visualization |

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- 16GB+ RAM recommended
- 50GB+ free disk space
- Internet connection (for initial model downloads)

### Installation

```bash
# Clone and navigate to project
cd Ideai-DockerAI-000

# Start all services
docker compose up --build -d

# Check service status
docker compose ps
```

### Access Points

- **Main Dashboard**: http://localhost:18000
- **Service Dashboard**: http://localhost:18000/dashboard
- **Grafana**: http://localhost:18007 (admin/admin)
- **Prometheus**: http://localhost:18006
- **Python RAG API**: http://localhost:18001
- **Rust Compute API**: http://localhost:18002
- **Qdrant**: http://localhost:18003
- **Ollama**: http://localhost:18005

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Technology Overview](docs/technology-overview.md)**: Deep dive into each technology and why it was chosen
- **[Development Guide](docs/development-guide.md)**: Key learnings, patterns, and best practices
- **[Architecture Decisions](docs/architecture-decisions.md)**: Design rationale and trade-offs
- **[API Reference](docs/api-reference.md)**: Complete API documentation

## 🎨 Features

### Dashboard
- Real-time service status monitoring
- Product cards with tech stack information
- Health checks and metrics visualization
- Quick links to all services
- Log viewer integration

### Model Management
- Support for Ollama models (Llama, Mistral, etc.)
- Integration with local Docker models
- Model configuration (temperature, top-p, etc.)
- Deepchecks parameter tuning

### RAG Pipeline
- Document ingestion into Qdrant
- Vector search and retrieval
- Context-augmented generation
- Embedding computation

### Performance Testing
- Rust/Wasm compute benchmarks
- Token generation metrics
- Latency tracking
- Throughput analysis

### Monitoring
- Prometheus metrics from all services
- Grafana dashboards
- Real-time health checks
- Performance visualization

## 🔧 Configuration

### Port Allocation

All services use ports in the **18000-18007** range to avoid conflicts. See [PORTS.md](PORTS.md) for details.

### Environment Variables

```bash
# Local model configuration
LOCAL_MODELS="my-model:http://my-model-service:8000"

# Or set in docker-compose.yaml
```

See [USER_GUIDE.md](USER_GUIDE.md) for detailed configuration options.

## 📖 Usage

See [USER_GUIDE.md](USER_GUIDE.md) for step-by-step instructions on:
- Starting the platform
- Using the dashboard
- Configuring models
- Running queries
- Ingesting documents
- Monitoring performance

## 🛠️ Development

### Project Structure

```
.
├── frontend/              # Next.js dashboard
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── Dockerfile
├── backend/
│   ├── python-rag/      # FastAPI RAG service
│   └── rust-wasm-compute/ # Rust compute service
├── monitoring/           # Prometheus & Grafana configs
├── docs/                # Documentation
└── docker-compose.yaml  # Service orchestration
```

### Building Services

```bash
# Build specific service
docker compose build [service-name]

# Rebuild all services
docker compose build

# Start services
docker compose up -d
```

### Development Workflow

1. Make code changes
2. Rebuild affected service: `docker compose build [service]`
3. Restart service: `docker compose restart [service]`
4. Check logs: `docker compose logs -f [service]`

## 🐛 Troubleshooting

### Common Issues

**Port conflicts**: Check [PORTS.md](PORTS.md) and ensure ports 18000-18007 are available

**Service won't start**: Check logs with `docker compose logs [service-name]`

**Models not loading**: See [USER_GUIDE.md](USER_GUIDE.md) troubleshooting section

**Build failures**: Ensure Docker has sufficient resources (memory, disk space)

## 📊 Performance

- **Rust Compute**: 10-100x faster than Python for mathematical operations
- **RAG Pipeline**: Sub-second retrieval from Qdrant vector database
- **Dashboard**: Real-time updates every 5 seconds
- **Metrics**: Prometheus scraping every 15 seconds

## 🔐 Security

- All services run in isolated Docker network
- No external API dependencies for core operations
- Local-only model execution
- Configurable authentication (Grafana)

## 🚢 Deployment

The platform is designed to be Kubernetes-ready:

- All services are containerized
- Health check endpoints implemented
- Prometheus metrics exposed
- Stateless service design
- Volume management for persistent data

## 📝 License

This project is designed for research and development purposes.

## 🤝 Contributing

This is a sovereign AI platform - contributions should maintain the principle of local-first, containerized deployment.

## 📚 Learn More

- [Technology Overview](docs/technology-overview.md) - Deep dive into each technology
- [Development Guide](docs/development-guide.md) - Key learnings and patterns
- [Architecture Decisions](docs/architecture-decisions.md) - Design rationale
- [API Reference](docs/api-reference.md) - Complete API docs

---

**Built with ❤️ for Sovereign AI**
