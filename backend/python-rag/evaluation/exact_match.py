"""Exact Match evaluation for fact-based QA."""

from typing import Dict
import re

def evaluate_exact_match(generated: str, reference: str, normalize: bool = True) -> Dict[str, float]:
    """
    Evaluate exact match for fact-based QA.
    
    Args:
        generated: Generated answer
        reference: Reference answer
        normalize: Whether to normalize text (lowercase, remove punctuation)
    
    Returns:
        Dictionary with exact match score
    """
    if normalize:
        # Normalize: lowercase, remove punctuation, strip whitespace
        gen_normalized = re.sub(r'[^\w\s]', '', generated.lower().strip())
        ref_normalized = re.sub(r'[^\w\s]', '', reference.lower().strip())
        
        exact_match = 1.0 if gen_normalized == ref_normalized else 0.0
    else:
        exact_match = 1.0 if generated.strip() == reference.strip() else 0.0
    
    return {
        "exact_match": float(exact_match),
        "match": bool(exact_match == 1.0)
    }

