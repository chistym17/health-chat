import os
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

load_dotenv()

class WebSearchAgent:
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment variables.")
        os.environ["TAVILY_API_KEY"] = api_key  

        self.search = TavilySearch(k=2)

    def run(self, query: str) -> list[str]:
        results = self.search.run(query)
        contents = [r["content"] for r in results.get("results", []) if r.get("content")]
        return contents

if __name__ == "__main__":
    test_agent = WebSearchAgent()
    print(test_agent.run("chest pain headache insomnia causes treatments"))


