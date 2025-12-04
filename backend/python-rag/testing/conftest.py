"""Pytest configuration and fixtures for model testing."""

import pytest
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture
def api_url():
    """Base API URL for testing."""
    return os.getenv("API_URL", "http://localhost:18001")

@pytest.fixture
def test_models():
    """List of test models."""
    return [
        "llama3.1",
        "mistral",
        "deepseek-r1-distill-llama",
        "gpt-oss",
        "qwen3-coder",
        "qwen3-vl"
    ]

@pytest.fixture
def sample_prompt():
    """Sample test prompt."""
    return "What is the capital of France?"

@pytest.fixture
def sample_ground_truth():
    """Sample ground truth answer."""
    return "The capital of France is Paris."


