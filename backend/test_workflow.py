import asyncio
import json
from workflows.proccess_workflow import process_workflow
from workflows.query_transformation_workflow import query_transformation_workflow
from agents.web_search_agent import WebSearchAgent, WebSearchParseAgent
from workflows.retrieval_workflow import retrieval_workflow
from agents.diagnosis_agent import DiagnosisAgent

def pretty_print(title, data):
    """Helper to print data in a readable format."""
    print(f"--- {title} ---")
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2))
    else:
        print(data)
    print("\\n" + "="*50 + "\\n")

async def run_full_test():
    """
    Runs the entire pipeline from user input to final diagnosis, printing each step.
    """
    user_text = "I have chest pain and a constant headache, and I can't sleep properly."
    pretty_print("User Input", user_text)

    # 1. Classification
    classification_result = await process_workflow.ainvoke({"text": user_text})
    pretty_print("1. Classification Result", classification_result)

    if classification_result.get("status") != "completed":
        print("Workflow stopped because the query was not classified as 'completed'.")
        return

    # 2. Query Transformation
    query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
    pretty_print("2. Query Transformation Result", query_transform_result)
    search_query = query_transform_result.get("search_query", "")
    symptoms = query_transform_result.get("symptoms", [])

    # 3. Web Search
    web_search_agent = WebSearchAgent()
    web_results = web_search_agent.run(search_query)
    pretty_print("3. Web Search Results (Raw)", web_results[:2]) 

    # 4. Parse Web Search Results
    web_parse_agent = WebSearchParseAgent()
    parsed_web_results = web_parse_agent.parse(web_results)
    pretty_print("4. Parsed Web Search Results", parsed_web_results)

    # 5. Local Retrieval
    retrieved_docs = await retrieval_workflow.ainvoke(search_query)
    if retrieved_docs and hasattr(retrieved_docs[0], 'page_content'):
        retrieved_chunks = [doc.page_content for doc in retrieved_docs]
    else:
        retrieved_chunks = [doc.get('content', str(doc)) for doc in retrieved_docs]
    pretty_print("5. Local Retrieval Results", retrieved_chunks)

    web_context = [f"Condition: {item['Name']}\\nSymptoms: {item['Symptoms']}\\nTreatments: {item['Treatments']}" for item in parsed_web_results]
    combined_chunks = retrieved_chunks + web_context
    pretty_print("6. Combined Context for Diagnosis", combined_chunks)

    diagnosis_agent = DiagnosisAgent()
    formatted_chunks = [{"page_content": chunk, "metadata": {}} for chunk in combined_chunks]
    final_diagnosis = diagnosis_agent.run(user_symptoms=user_text, chunks=formatted_chunks)
    pretty_print("7. Final Diagnosis", final_diagnosis)


if __name__ == "__main__":
    asyncio.run(run_full_test()) 