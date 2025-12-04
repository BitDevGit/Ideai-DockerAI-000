#!/bin/bash
set -e

echo "Installing core dependencies..."
pip install --no-cache-dir --timeout=300 --retries=3 \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    numpy==1.26.2 \
    scipy==1.10.1 \
    pandas==2.1.4 \
    qdrant-client==1.7.0 \
    python-dotenv==1.0.0 \
    requests==2.31.0 \
    prometheus-client==0.19.0 \
    pydantic==2.5.2

echo "Installing evaluation dependencies..."
pip install --no-cache-dir --timeout=300 --retries=3 \
    rouge-score>=0.1.2 \
    bert-score>=0.3.13 \
    nltk>=3.8.1 \
    sentence-transformers>=2.2.2

echo "Installing ragas (this may take a while, may hang on llama_index_legacy)..."
# Install ragas - if it hangs, you can Ctrl+C and rebuild, it will continue without it
# The code handles missing ragas gracefully
pip install --no-cache-dir --timeout=600 --retries=3 ragas>=0.1.0 || {
    echo "WARNING: ragas installation failed or timed out. Continuing without it..."
    echo "RAGAS evaluation will return placeholder scores."
}

echo "Installing optional dependencies..."
pip install --no-cache-dir --timeout=300 --retries=3 deepchecks==0.17.5 || echo "deepchecks install failed, continuing..."
pip install --no-cache-dir --timeout=300 --retries=3 pytest>=7.4.0 pytest-asyncio>=0.21.0 || echo "pytest install failed, continuing..."
pip install --no-cache-dir --timeout=300 --retries=3 lm-eval>=0.4.0 || echo "lm-eval install failed, continuing..."

echo "Dependencies installation complete!"

