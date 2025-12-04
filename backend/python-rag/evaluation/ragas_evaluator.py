"""RAGAS evaluation for RAG quality metrics."""

from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def evaluate_ragas(
    query: str,
    context: List[str],
    answer: str,
    ground_truth: str = None
) -> Dict[str, float]:
    """
    Evaluate RAG quality using RAGAS metrics.
    
    Args:
        query: User query
        context: Retrieved context documents
        answer: Generated answer
        ground_truth: Ground truth answer (optional)
    
    Returns:
        Dictionary with RAGAS scores
    """
    try:
        from ragas import evaluate
        from ragas.metrics import (
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall
        )
        from datasets import Dataset
        
        # Prepare data for RAGAS
        data = {
            "question": [query],
            "contexts": [[ctx for ctx in context]],
            "answer": [answer],
        }
        
        if ground_truth:
            data["ground_truth"] = [ground_truth]
        
        dataset = Dataset.from_dict(data)
        
        # Select metrics
        metrics = [faithfulness, answer_relevancy]
        
        if ground_truth:
            metrics.extend([context_precision, context_recall])
        
        # Evaluate
        result = evaluate(dataset, metrics=metrics)
        
        scores = result.to_dict()
        
        return {
            "faithfulness": float(scores.get("faithfulness", [0.0])[0]) if "faithfulness" in scores else 0.0,
            "answer_relevancy": float(scores.get("answer_relevancy", [0.0])[0]) if "answer_relevancy" in scores else 0.0,
            "context_precision": float(scores.get("context_precision", [0.0])[0]) if "context_precision" in scores else 0.0,
            "context_recall": float(scores.get("context_recall", [0.0])[0]) if "context_recall" in scores else 0.0,
            "ragas_score": float(
                (scores.get("faithfulness", [0.0])[0] + 
                 scores.get("answer_relevancy", [0.0])[0]) / 2
            ) if "faithfulness" in scores and "answer_relevancy" in scores else 0.0
        }
    except ImportError:
        logger.warning("RAGAS not installed, returning placeholder scores")
        return {
            "faithfulness": 0.0,
            "answer_relevancy": 0.0,
            "context_precision": 0.0,
            "context_recall": 0.0,
            "ragas_score": 0.0,
            "error": "RAGAS not installed"
        }
    except Exception as e:
        logger.error(f"Error in RAGAS evaluation: {e}")
        return {
            "faithfulness": 0.0,
            "answer_relevancy": 0.0,
            "context_precision": 0.0,
            "context_recall": 0.0,
            "ragas_score": 0.0,
            "error": str(e)
        }

