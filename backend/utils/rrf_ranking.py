import math
from typing import List, Dict, Any, Tuple

def calculate_rrf_score(rank: int, k: float = 60.0) -> float:
    return 1.0 / (k + rank)

def rank_vector_results(vector_results: List[str]) -> List[Tuple[str, int]]:
    """
    Rank vector store results in ascending order (best first).
    
    Args:
        vector_results: List of results from vector store
    
    Returns:
        List of tuples (result, rank) where rank is 1-based
    """
    return [(result, i + 1) for i, result in enumerate(vector_results)]

def rank_web_results(web_results: List[Dict[str, str]]) -> List[Tuple[Dict[str, str], int]]:
    """
    Rank web search results in ascending order (best first).
    
    Args:
        web_results: List of structured web results
    
    Returns:
        List of tuples (result, rank) where rank is 1-based
    """
    return [(result, i + 1) for i, result in enumerate(web_results)]

def combine_and_rank_with_rrf(
    vector_results: List[str], 
    web_results: List[Dict[str, str]], 
    k: float = 60.0
) -> List[Dict[str, Any]]:
    """
    Combine vector store and web search results using RRF ranking.
    
    Args:
        vector_results: List of results from vector store
        web_results: List of structured results from web search
        k: RRF constant (default: 60.0)
    
    Returns:
        List of combined results with RRF scores, sorted by score (highest first)
    """
    # Rank both sources
    ranked_vector = rank_vector_results(vector_results)
    ranked_web = rank_web_results(web_results)
    
    # Create a dictionary to store combined scores
    combined_scores = {}
    
    # Add vector results with their RRF scores
    for result, rank in ranked_vector:
        rrf_score = calculate_rrf_score(rank, k)
        combined_scores[result] = {
            'content': result,
            'source': 'vector',
            'rank': rank,
            'rrf_score': rrf_score,
            'combined_score': rrf_score
        }
    
    # Add web results with their RRF scores
    for result, rank in ranked_web:
        # Convert web result to string for consistent handling
        result_str = f"Condition: {result['Name']}\nSymptoms: {result['Symptoms']}\nTreatments: {result['Treatments']}"
        
        if result_str in combined_scores:
            # If same content exists, add to combined score
            combined_scores[result_str]['combined_score'] += calculate_rrf_score(rank, k)
            combined_scores[result_str]['web_rank'] = rank
            combined_scores[result_str]['web_rrf_score'] = calculate_rrf_score(rank, k)
        else:
            # New content
            combined_scores[result_str] = {
                'content': result_str,
                'source': 'web',
                'rank': rank,
                'rrf_score': calculate_rrf_score(rank, k),
                'combined_score': calculate_rrf_score(rank, k),
                'original_web_result': result
            }
    
    # Sort by combined RRF score (highest first)
    sorted_results = sorted(
        combined_scores.values(), 
        key=lambda x: x['combined_score'], 
        reverse=True
    )
    
    return sorted_results

def get_top_results(
    vector_results: List[str], 
    web_results: List[Dict[str, str]], 
    top_k: int = 5,
    k: float = 60.0
) -> List[Dict[str, Any]]:
    """
    Get top-k results after RRF ranking.
    
    Args:
        vector_results: List of results from vector store
        web_results: List of structured results from web search
        top_k: Number of top results to return
        k: RRF constant
    
    Returns:
        Top-k combined results
    """
    combined_results = combine_and_rank_with_rrf(vector_results, web_results, k)
    return combined_results[:top_k] 