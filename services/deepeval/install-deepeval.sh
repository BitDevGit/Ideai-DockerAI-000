#!/bin/bash
set -e

echo "Installing core dependencies..."
pip install --no-cache-dir fastapi==0.104.1 uvicorn[standard]==0.24.0 requests==2.31.0 pydantic==2.5.2

echo "Installing llama-index separately first (to avoid hang during deepeval install)..."
# Install llama-index core first with timeout - this is the problematic dependency
timeout 600 pip install --no-cache-dir --timeout=300 --retries=2 "llama-index>=0.9.0" || {
    echo "llama-index installation timed out, trying minimal version..."
    timeout 300 pip install --no-cache-dir --timeout=180 "llama-index-core" || {
        echo "WARNING: llama-index installation failed, deepeval may have limited functionality"
    }
}

echo "Installing deepeval (llama-index should already be installed)..."
# Now install deepeval - it should find llama-index already installed
timeout 300 pip install --no-cache-dir --timeout=180 --retries=2 "deepeval>=0.18.0" || {
    echo "DeepEval installation failed, trying without dependencies..."
    pip install --no-cache-dir --timeout=180 "deepeval>=0.18.0" --no-deps || {
        echo "DeepEval installation failed completely"
        exit 1
    }
}

echo "Dependencies installation complete!"

