"""BLEU and ROUGE evaluation for text generation."""

from typing import Dict
import logging

logger = logging.getLogger(__name__)

def evaluate_bleu_rouge(generated: str, reference: str) -> Dict[str, float]:
    """
    Evaluate text generation using BLEU and ROUGE metrics.
    
    Args:
        generated: Generated text
        reference: Reference text
    
    Returns:
        Dictionary with BLEU and ROUGE scores
    """
    try:
        # BLEU score
        try:
            from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
            from nltk.tokenize import word_tokenize
            
            # Download required NLTK data
            import nltk
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt', quiet=True)
            
            smoothing = SmoothingFunction().method1
            gen_tokens = word_tokenize(generated.lower())
            ref_tokens = word_tokenize(reference.lower())
            
            bleu = sentence_bleu([ref_tokens], gen_tokens, smoothing_function=smoothing)
        except ImportError:
            logger.warning("NLTK not available for BLEU, using simple calculation")
            # Simple BLEU approximation
            gen_words = generated.lower().split()
            ref_words = reference.lower().split()
            if len(ref_words) == 0:
                bleu = 0.0
            else:
                matches = sum(1 for w in gen_words if w in ref_words)
                bleu = matches / max(len(gen_words), 1)
        
        # ROUGE scores
        try:
            from rouge_score import rouge_scorer
            
            scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
            rouge_scores = scorer.score(reference, generated)
            
            rouge_1 = rouge_scores['rouge1'].fmeasure
            rouge_2 = rouge_scores['rouge2'].fmeasure
            rouge_l = rouge_scores['rougeL'].fmeasure
        except ImportError:
            logger.warning("rouge-score not available, using simple calculation")
            # Simple ROUGE approximation
            gen_words = set(generated.lower().split())
            ref_words = set(reference.lower().split())
            
            if len(ref_words) == 0:
                rouge_1 = rouge_2 = rouge_l = 0.0
            else:
                intersection = gen_words & ref_words
                rouge_1 = len(intersection) / len(ref_words)
                rouge_2 = 0.0  # Simplified
                rouge_l = rouge_1  # Simplified
        
        return {
            "bleu": float(bleu),
            "rouge_1": float(rouge_1),
            "rouge_2": float(rouge_2),
            "rouge_l": float(rouge_l)
        }
    except Exception as e:
        logger.error(f"Error in BLEU/ROUGE evaluation: {e}")
        return {
            "bleu": 0.0,
            "rouge_1": 0.0,
            "rouge_2": 0.0,
            "rouge_l": 0.0,
            "error": str(e)
        }

