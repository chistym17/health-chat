from langchain_core.runnables import RunnableLambda
from agents.web_search_agent import WebSearchAgent, WebSearchParseAgent

web_search_agent = WebSearchAgent()
web_parse_agent = WebSearchParseAgent()

def run_websearch(query: str) -> list[dict]:

    web_results = web_search_agent.run(query)
    parsed_results = web_parse_agent.parse(web_results)
    
    return parsed_results

websearch_workflow = RunnableLambda(lambda input: run_websearch(input["query"]))

