import math
from typing import List, Dict, Any, Tuple

def calculate_rrf_score(rank: int, k: float = 60.0) -> float:
    """
    Calculate Reciprocal Rank Fusion score for a given rank.
    
    Args:
        rank: The rank of the item (1-based)
        k: A constant that controls the influence of lower-ranked items (default: 60.0)
    
    Returns:
        RRF score
    """
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

def format_vector_result_as_structured(content: str) -> Dict[str, str]:
    """
    Format vector result into structured format for consistency.
    
    Args:
        content: Raw content from vector search
    
    Returns:
        Structured format with Name, Symptoms, Treatments
    """
    # Extract the most relevant information from vector content
    # This is a simple heuristic - you might want to improve this
    lines = content.split('\n')
    name = "Medical Information"
    symptoms = ""
    treatments = ""
    
    for line in lines:
        line = line.strip()
        if any(keyword in line.lower() for keyword in ['symptom', 'sign', 'pain', 'ache']):
            symptoms += line + " "
        elif any(keyword in line.lower() for keyword in ['treatment', 'therapy', 'medication', 'cure']):
            treatments += line + " "
    
    return {
        "Name": name,
        "Symptoms": symptoms.strip() if symptoms else "Information from medical database",
        "Treatments": treatments.strip() if treatments else "Consult healthcare provider"
    }

def combine_and_rank_with_rrf(
    vector_results: List[str], 
    web_results: List[Dict[str, str]], 
    k: float = 60.0
) -> List[Dict[str, Any]]:
    """
    Combine vector store and web search results using RRF ranking.
    Preserves structured format for better LLM clarity.
    
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
        structured_result = format_vector_result_as_structured(result)
        
        # Use a unique key for vector results
        vector_key = f"vector_{rank}"
        combined_scores[vector_key] = {
            'structured_data': structured_result,
            'source': 'vector',
            'rank': rank,
            'rrf_score': rrf_score,
            'combined_score': rrf_score,
            'raw_content': result
        }
    
    # Add web results with their RRF scores
    for result, rank in ranked_web:
        rrf_score = calculate_rrf_score(rank, k)
        
        # Use condition name as key for web results
        web_key = result['Name'].lower().replace(' ', '_')
        
        if web_key in combined_scores:
            # If same condition exists, add to combined score
            combined_scores[web_key]['combined_score'] += rrf_score
            combined_scores[web_key]['web_rank'] = rank
            combined_scores[web_key]['web_rrf_score'] = rrf_score
        else:
            # New condition
            combined_scores[web_key] = {
                'structured_data': result,
                'source': 'web',
                'rank': rank,
                'rrf_score': rrf_score,
                'combined_score': rrf_score
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
        Top-k combined results with structured data
    """
    combined_results = combine_and_rank_with_rrf(vector_results, web_results, k)
    return combined_results[:top_k]

def get_structured_results_for_llm(
    vector_results: List[str], 
    web_results: List[Dict[str, str]], 
    top_k: int = 5,
    k: float = 60.0
) -> List[Dict[str, str]]:
    """
    Get top-k structured results ready for LLM consumption.
    
    Args:
        vector_results: List of results from vector store
        web_results: List of structured results from web search
        top_k: Number of top results to return
        k: RRF constant
    
    Returns:
        List of structured medical data (Name, Symptoms, Treatments) sorted by RRF score
    """
    combined_results = combine_and_rank_with_rrf(vector_results, web_results, k)
    return [result['structured_data'] for result in combined_results[:top_k]] 