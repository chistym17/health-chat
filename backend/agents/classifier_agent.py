from agents.base_agent import BaseAgent
from llm.gemini_llm import get_gemini_llm
import json
from prompts.prompts import CLASSIFIER_PROMPT
from langchain_core.messages import HumanMessage
import re

class ClassifierAgent(BaseAgent):
    def __init__(self):
        self.llm = get_gemini_llm()

    def run(self, input_text: str) -> dict:
        prompt = CLASSIFIER_PROMPT.format(input_text=input_text)

        try:
            message = HumanMessage(content=prompt)
            response = self.llm.invoke([message])  


            if not response or not response.content.strip():
                print("Warning: Empty response from LLM.")
                return {"decision": "Not Relevant", "questions": []}
            
            content = response.content.strip()

            
            content = re.sub(r"```json|```", "", content).strip()

            return json.loads(content)

        except json.JSONDecodeError:
            print(f"JSONDecodeError: Could not parse LLM response: {response.content}")
            return {"decision": "Not Relevant", "questions": []}
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return {"decision": "Not Relevant", "questions": []}


