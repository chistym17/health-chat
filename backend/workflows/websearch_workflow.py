from langchain_core.runnables import RunnableLambda
from agents.web_search_agent import WebSearchAgent, WebSearchParseAgent

web_search_agent = WebSearchAgent()
web_parse_agent = WebSearchParseAgent()

def run_websearch(query: str) -> list[dict]:

    web_results = web_search_agent.run(query)
    parsed_results = web_parse_agent.parse(web_results)
    
    return parsed_results

websearch_workflow = RunnableLambda(lambda input: run_websearch(input["query"]))

if __name__ == "__main__":
    test_query = "chest pain headache insomnia causes treatments"
    result = websearch_workflow.invoke({"query": test_query})
    print("WebSearch Workflow Result:")
    for i, item in enumerate(result, 1):
        print(f"\n{i}. {item['Name']}")
        print(f"   Symptoms: {item['Symptoms']}")
        print(f"   Treatments: {item['Treatments']}") 