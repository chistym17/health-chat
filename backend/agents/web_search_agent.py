import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
import json
from llm.gemini_llm import get_gemini_llm
from prompts.prompts import WEB_SEARCH_PARSE_PROMPT
from langchain_core.messages import HumanMessage

load_dotenv()

class WebSearchAgent:
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment variables.")
        os.environ["TAVILY_API_KEY"] = api_key  

        self.search = TavilySearch(k=10)

    def run(self, query: str) -> list[str]:
        results = self.search.run(query)
        contents = [r["content"] for r in results.get("results", []) if r.get("content")]
        return contents

class WebSearchParseAgent:
    def __init__(self):
        self.llm = get_gemini_llm()

    def parse(self, search_results: list[str]) -> list[dict]:
        joined_results = "\n".join(search_results)
        prompt = WEB_SEARCH_PARSE_PROMPT + f"\nSearch Results:\n{joined_results}"
        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        content = content.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(content)
        except Exception:
            return []



