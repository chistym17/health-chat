import json
import asyncio
from utils.rrf_ranking import (
    calculate_rrf_score, 
    rank_vector_results, 
    rank_web_results, 
    combine_and_rank_with_rrf,
    get_top_results,
    get_structured_results_for_llm
)
from workflows.query_transformation_workflow import query_transformation_workflow
from agents.web_search_agent import WebSearchAgent, WebSearchParseAgent
from workflows.retrieval_workflow import retrieval_workflow

def pretty_print(title, data):
    """Helper to print data in a readable format."""
    print(f"\n--- {title} ---")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2))
    else:
        print(data)
    print("="*60)

async def test_full_pipeline_with_rrf():
    """Test the complete pipeline with RRF ranking using real user input."""
    
    # User input
    user_text = "I have chest pain and a constant headache, and I can't sleep properly."
    pretty_print("User Input", user_text)
    
    # Step 1: Query Transformation
    print("\n🔄 Step 1: Query Transformation...")
    query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
    pretty_print("Query Transformation Result", query_transform_result)
    
    search_query = query_transform_result.get("search_query", "")
    symptoms = query_transform_result.get("symptoms", [])
    
    # Step 2: Web Search
    print("\n🌐 Step 2: Web Search...")
    web_search_agent = WebSearchAgent()
    web_results = web_search_agent.run(search_query)
    pretty_print("Raw Web Search Results (first 2)", web_results[:2])
    
    # Step 3: Parse Web Results
    print("\n📝 Step 3: Parse Web Results...")
    web_parse_agent = WebSearchParseAgent()
    parsed_web_results = web_parse_agent.parse(web_results)
    pretty_print("Parsed Web Results", parsed_web_results)
    
    # Step 4: Vector Search
    print("\n🔍 Step 4: Vector Search...")
    vector_docs = await retrieval_workflow.ainvoke(search_query)
    # Handle both Document objects and dictionaries
    if vector_docs and hasattr(vector_docs[0], 'page_content'):
        vector_results = [doc.page_content for doc in vector_docs]
    else:
        # Handle dictionaries (from FAISS search)
        vector_results = [doc.get('content', str(doc)) for doc in vector_docs]
    pretty_print("Vector Search Results", vector_results)
    
    # Step 5: RRF Ranking
    print("\n🏆 Step 5: RRF Ranking...")
    
    # Test individual ranking functions
    ranked_vector = rank_vector_results(vector_results)
    ranked_web = rank_web_results(parsed_web_results)
    
    pretty_print("Ranked Vector Results", ranked_vector)
    pretty_print("Ranked Web Results", ranked_web)
    
    # Test RRF score calculation
    print("\n📊 RRF Score Examples:")
    for i in range(1, 6):
        score = calculate_rrf_score(i)
        print(f"Rank {i}: RRF Score = {score:.6f}")
    
    # Combine and rank with RRF
    combined_results = combine_and_rank_with_rrf(vector_results, parsed_web_results)
    pretty_print("Combined Results with RRF Ranking", combined_results)
    
    # Get top results
    top_5_results = get_top_results(vector_results, parsed_web_results, top_k=5)
    pretty_print("Top 5 Results", top_5_results)
    
    # Get structured results for LLM
    structured_results = get_structured_results_for_llm(vector_results, parsed_web_results, top_k=5)
    pretty_print("Structured Results for LLM", structured_results)
    
    # Detailed analysis
    print("\n📈 Detailed RRF Analysis:")
    for i, result in enumerate(combined_results[:5], 1):
        print(f"\n{i}. Combined Score: {result['combined_score']:.6f}")
        print(f"   Source: {result['source']}")
        print(f"   Rank: {result['rank']}")
        print(f"   Condition: {result['structured_data']['Name']}")
        print(f"   Symptoms: {result['structured_data']['Symptoms'][:100]}...")
        if 'web_rank' in result:
            print(f"   Also found in web results at rank: {result['web_rank']}")
    
    # Summary
    print("\n🎯 Pipeline Summary:")
    print(f"• User Input: {user_text}")
    print(f"• Transformed Query: {search_query}")
    print(f"• Extracted Symptoms: {symptoms}")
    print(f"• Vector Results Count: {len(vector_results)}")
    print(f"• Web Results Count: {len(parsed_web_results)}")
    print(f"• Combined Results Count: {len(combined_results)}")
    print(f"• Top Result Score: {combined_results[0]['combined_score']:.6f}")
    
    # Step 6: Generate Diagnosis (Optional - for complete pipeline test)
    print("\n🏥 Step 6: Generate Diagnosis...")
    from agents.diagnosis_agent import DiagnosisAgent
    diagnosis_agent = DiagnosisAgent()
    
    # Use structured results for diagnosis
    formatted_chunks = []
    for result in structured_results:
        chunk = {
            "page_content": f"Condition: {result['Name']}\nSymptoms: {result['Symptoms']}\nTreatments: {result['Treatments']}",
            "metadata": {"name": result['Name']}
        }
        formatted_chunks.append(chunk)
    
    final_diagnosis = diagnosis_agent.run(user_symptoms=user_text, chunks=formatted_chunks)
    pretty_print("Final Diagnosis", final_diagnosis)

def test_rrf_ranking():
    """Test RRF ranking with sample data."""
    
    # Sample vector store results (medical information chunks)
    vector_results = [
        "Chest pain can be caused by various conditions including heart attack, angina, and anxiety disorders. Symptoms may include pressure, tightness, or burning sensation in the chest.",
        "Headaches are common and can be caused by stress, tension, dehydration, or underlying medical conditions. Treatment options include pain relievers, rest, and addressing underlying causes.",
        "Insomnia is a sleep disorder characterized by difficulty falling asleep or staying asleep. Treatment includes sleep hygiene practices, cognitive behavioral therapy, and sometimes medication.",
        "Anxiety disorders can cause physical symptoms like chest pain, rapid heartbeat, and difficulty breathing. Treatment involves therapy, medication, and stress management techniques.",
        "Gastroesophageal reflux disease (GERD) can cause chest pain that mimics heart problems. Treatment includes dietary changes, medication, and lifestyle modifications."
    ]
    
    # Sample web search results (structured data)
    web_results = [
        {
            "Name": "Panic Attack",
            "Symptoms": "Chest pain, shortness of breath, palpitations, dizziness",
            "Treatments": "Breathing exercises, relaxation techniques, cognitive behavioral therapy"
        },
        {
            "Name": "Tension Headache",
            "Symptoms": "Dull, aching pain in head, pressure around forehead",
            "Treatments": "Over-the-counter pain relievers, stress management, relaxation techniques"
        },
        {
            "Name": "Insomnia",
            "Symptoms": "Difficulty falling asleep, waking up frequently, daytime fatigue",
            "Treatments": "Sleep hygiene, cognitive behavioral therapy, prescription sleep aids"
        },
        {
            "Name": "Anxiety Disorder",
            "Symptoms": "Excessive worry, restlessness, chest pain, difficulty concentrating",
            "Treatments": "Therapy, medication, lifestyle changes, support groups"
        },
        {
            "Name": "GERD",
            "Symptoms": "Chest pain, heartburn, acid reflux, difficulty swallowing",
            "Treatments": "Dietary changes, antacids, prescription medications, lifestyle modifications"
        }
    ]
    
    pretty_print("Original Vector Results", vector_results)
    pretty_print("Original Web Results", web_results)
    
    # Test individual ranking functions
    ranked_vector = rank_vector_results(vector_results)
    ranked_web = rank_web_results(web_results)
    
    pretty_print("Ranked Vector Results", ranked_vector)
    pretty_print("Ranked Web Results", ranked_web)
    
    # Test RRF score calculation
    print("\n--- RRF Score Examples ---")
    for i in range(1, 6):
        score = calculate_rrf_score(i)
        print(f"Rank {i}: RRF Score = {score:.6f}")
    
    # Test full RRF combination
    combined_results = combine_and_rank_with_rrf(vector_results, web_results)
    pretty_print("Combined Results with RRF Ranking", combined_results)
    
    # Test getting top results
    top_3_results = get_top_results(vector_results, web_results, top_k=3)
    pretty_print("Top 3 Results", top_3_results)
    
    # Show detailed breakdown
    print("\n--- Detailed RRF Analysis ---")
    for i, result in enumerate(combined_results[:5], 1):
        print(f"\n{i}. Combined Score: {result['combined_score']:.6f}")
        print(f"   Source: {result['source']}")
        print(f"   Rank: {result['rank']}")
        print(f"   Content: {result['content'][:100]}...")
        if 'web_rank' in result:
            print(f"   Also found in web results at rank: {result['web_rank']}")

if __name__ == "__main__":
    print("🚀 Testing Full Pipeline with RRF Ranking...")
    asyncio.run(test_full_pipeline_with_rrf())
    
    print("\n" + "="*80)
    print("🧪 Testing RRF with Sample Data...")
    test_rrf_ranking() 