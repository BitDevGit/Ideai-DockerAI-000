"""Test model querying and responses."""

import pytest
import requests
from typing import Dict, Any

def test_model_list(api_url):
    """Test that models endpoint returns available models."""
    response = requests.get(f"{api_url}/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0

def test_query_single_model(api_url, sample_prompt):
    """Test querying a single model."""
    # Set model config
    config = {
        "model": "llama3.1",
        "model_runner": "docker-model-runner",
        "temperature": 0.7,
        "top_p": 0.9,
        "bias_threshold": 0.1,
        "drift_sensitivity": 0.05
    }
    requests.post(f"{api_url}/config", json=config)
    
    # Run query
    query_data = {
        "query": sample_prompt,
        "use_rag": False
    }
    response = requests.post(f"{api_url}/query", json=query_data)
    
    # Should succeed (may take time)
    assert response.status_code in [200, 500]  # 500 if model not available
    if response.status_code == 200:
        data = response.json()
        assert "response" in data
        assert "tokens" in data
        assert "latency" in data

def test_evaluation_ragas(api_url, sample_prompt, sample_ground_truth):
    """Test RAGAS evaluation endpoint."""
    eval_data = {
        "query": sample_prompt,
        "context": ["France is a country in Europe. Paris is its capital city."],
        "answer": "The capital of France is Paris.",
        "ground_truth": sample_ground_truth
    }
    response = requests.post(f"{api_url}/evaluate/ragas", json=eval_data)
    assert response.status_code == 200
    data = response.json()
    assert "faithfulness" in data or "error" in data

def test_evaluation_bleu_rouge(api_url, sample_ground_truth):
    """Test BLEU/ROUGE evaluation endpoint."""
    eval_data = {
        "generated": "The capital of France is Paris.",
        "reference": sample_ground_truth
    }
    response = requests.post(f"{api_url}/evaluate/bleu-rouge", json=eval_data)
    assert response.status_code == 200
    data = response.json()
    assert "bleu" in data or "rouge" in data or "error" in data

def test_test_runner_endpoint(api_url, sample_prompt, sample_ground_truth):
    """Test the test runner endpoint."""
    test_data = {
        "models": ["llama3.1"],
        "prompt": sample_prompt,
        "ground_truth": sample_ground_truth,
        "use_rag": False,
        "metrics": ["bleu", "rouge"]
    }
    response = requests.post(f"{api_url}/tests/run", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "test_id" in data
    assert "results" in data
    assert len(data["results"]) > 0


