#!/bin/bash

# AI Pen Knife - Startup Script
# This script builds and starts all services

set -e

echo "🚀 Starting AI Pen Knife - Sovereign AI Test Platform"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: docker-compose is not installed. Please install Docker Compose."
    exit 1
fi

# Use docker compose (newer) or docker-compose (older)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Building and starting all services..."
echo "   This may take several minutes on first run..."
echo ""

$COMPOSE_CMD up --build -d

echo ""
echo "✅ Services are starting up!"
echo ""
echo "📊 Access the platform at:"
echo "   - Frontend Dashboard: http://localhost:3000"
echo "   - Grafana:            http://localhost:3001 (admin/admin)"
echo "   - Prometheus:         http://localhost:9090"
echo "   - Python RAG API:     http://localhost:8000"
echo "   - Rust Compute API:   http://localhost:8080"
echo "   - Qdrant:             http://localhost:6333"
echo "   - Ollama:             http://localhost:11434"
echo ""
echo "⏳ Note: Ollama will download models on first startup."
echo "   This may take 10-30 minutes depending on your connection."
echo ""
echo "📝 To view logs: $COMPOSE_CMD logs -f [service-name]"
echo "🛑 To stop:      $COMPOSE_CMD down"
echo ""


