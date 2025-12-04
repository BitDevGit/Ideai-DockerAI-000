"""BERTScore evaluation for semantic similarity."""

from typing import Dict
import logging

logger = logging.getLogger(__name__)

def evaluate_bertscore(generated: str, reference: str) -> Dict[str, float]:
    """
    Evaluate semantic similarity using BERTScore.
    
    Args:
        generated: Generated text
        reference: Reference text
    
    Returns:
        Dictionary with BERTScore metrics
    """
    try:
        from bert_score import score
        
        P, R, F1 = score([generated], [reference], lang='en', verbose=False)
        
        return {
            "precision": float(P[0].item()),
            "recall": float(R[0].item()),
            "f1": float(F1[0].item())
        }
    except ImportError:
        logger.warning("bert-score not installed, using sentence-transformers fallback")
        try:
            from sentence_transformers import SentenceTransformer
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            
            model = SentenceTransformer('all-MiniLM-L6-v2')
            gen_embedding = model.encode([generated])
            ref_embedding = model.encode([reference])
            
            similarity = cosine_similarity(gen_embedding, ref_embedding)[0][0]
            
            return {
                "precision": float(similarity),
                "recall": float(similarity),
                "f1": float(similarity),
                "similarity": float(similarity),
                "note": "Using sentence-transformers as fallback"
            }
        except Exception as e:
            logger.error(f"Error in BERTScore fallback: {e}")
            return {
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
                "error": str(e)
            }
    except Exception as e:
        logger.error(f"Error in BERTScore evaluation: {e}")
        return {
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "error": str(e)
        }

