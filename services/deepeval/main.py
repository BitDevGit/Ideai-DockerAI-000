"""DeepEval service for LLM evaluation."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import requests
import os
import logging

logger = logging.getLogger(__name__)

# Try to import deepeval, but make it optional
try:
    import deepeval
    DEEPEVAL_AVAILABLE = True
except ImportError:
    DEEPEVAL_AVAILABLE = False
    logger.warning("DeepEval not installed - service will proxy to main evaluation API")

app = FastAPI(title="DeepEval Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_URL = os.getenv("API_URL", "http://python-rag:8000")

class EvaluationRequest(BaseModel):
    test_cases: List[Dict[str, Any]]
    model: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "DeepEval Service", 
        "status": "running",
        "deepeval_available": DEEPEVAL_AVAILABLE
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/evaluate")
async def evaluate(request: EvaluationRequest):
    """Run DeepEval evaluation"""
    try:
        # DeepEval integration would go here
        # For now, proxy to main evaluation service
        results = []
        for test_case in request.test_cases:
            # Call comprehensive evaluation endpoint
            eval_response = requests.post(
                f"{API_URL}/evaluate/comprehensive",
                json={
                    "query": test_case.get("query", ""),
                    "context": test_case.get("context", []),
                    "answer": test_case.get("answer", ""),
                    "ground_truth": test_case.get("ground_truth"),
                    "model": request.model or test_case.get("model")
                }
            )
            if eval_response.status_code == 200:
                results.append(eval_response.json())
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

