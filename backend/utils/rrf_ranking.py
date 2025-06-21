import math
from typing import List, Dict, Any, Tuple

def calculate_rrf_score(rank: int, k: float = 60.0) -> float:
    return 1.0 / (k + rank)

def rank_vector_results(vector_results: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], int]]:
   return [(result, i + 1) for i, result in enumerate(vector_results)]

def rank_web_results(web_results: List[Dict[str, str]]) -> List[Tuple[Dict[str, str], int]]:
    return [(result, i + 1) for i, result in enumerate(web_results)]

def combine_and_rank_with_rrf(
    vector_results: List[Dict[str, Any]], 
    web_results: List[Dict[str, str]], 
    k: float = 60.0
) -> List[Dict[str, Any]]:
 
    ranked_vector = rank_vector_results(vector_results)
    ranked_web = rank_web_results(web_results)
    
    combined_scores = {}
    
    for result, rank in ranked_vector:
        rrf_score = calculate_rrf_score(rank, k)
        vector_key = result.get('Name', f'vector_{rank}').lower().replace(' ', '_')
        
        combined_scores[vector_key] = {
            'result': result,
            'combined_score': rrf_score
        }
    
    for result, rank in ranked_web:
        rrf_score = calculate_rrf_score(rank, k)
        web_key = result.get('Name', f'web_{rank}').lower().replace(' ', '_')
        
        if web_key in combined_scores:
            combined_scores[web_key]['combined_score'] += rrf_score
        else:
            combined_scores[web_key] = {
                'result': result,
                'combined_score': rrf_score
            }
    
    sorted_results = sorted(
        combined_scores.values(), 
        key=lambda x: x['combined_score'], 
        reverse=True
    )
    
    return [item['result'] for item in sorted_results]

def get_top_results(
    vector_results: List[Dict[str, Any]], 
    web_results: List[Dict[str, str]], 
    top_k: int = 5,
    k: float = 60.0
) -> List[Dict[str, Any]]:

    combined_results = combine_and_rank_with_rrf(vector_results, web_results, k)
    return combined_results[:top_k] 