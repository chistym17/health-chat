from llm.gemini_llm import get_gemini_llm
from langchain_core.messages import HumanMessage
from prompts.prompts import TRANSFORM_QUERY_PROMPT
import re
import json

class QueryTransformationAgent:
    def __init__(self):
        self.llm = get_gemini_llm()

    def transform(self, user_input: str) -> dict:
        prompt = TRANSFORM_QUERY_PROMPT.format(user_input=user_input)
        response = self.llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        content = re.sub(r"```json|```", "", content).strip()
        return json.loads(content)



if __name__ == "__main__":
    agent = QueryTransformationAgent()
    print(agent.transform("i have chest pain. i also have a headache, i can not sleep properly"))
