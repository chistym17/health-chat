from llm.gemini_llm import get_gemini_llm
from prompts.prompts import DIAGNOSIS_PROMPT
from langchain_core.messages import HumanMessage
import asyncio

class DiagnosisAgent:
    def __init__(self):
        self.llm = get_gemini_llm()

    def run(self, user_symptoms: str, chunks: list[str]) -> str:
        joined_chunks = "\n\n".join(chunks)

        prompt = DIAGNOSIS_PROMPT.format(user_symptoms=user_symptoms, chunks=joined_chunks)
        messages = [HumanMessage(content=prompt)]

        response = self.llm.invoke(messages)  
        return response.content


# if __name__ == "__main__":
#     import asyncio

#     test_user_symptoms = "I have chest pain and shortness of breath."
#     test_chunks = [
#         "Name: Pneumonia\nSymptoms: cough, fever, chest pain\nTreatments: antibiotics, rest",
#         "Name: Lung Contusion\nSymptoms: chest pain, difficulty breathing\nTreatments: supportive care"
#     ]

#     async def test():
#         agent = DiagnosisAgent()
#         result = agent.run(test_user_symptoms, test_chunks)
#         print("Diagnosis and Measures:")
#         print(result)

#     asyncio.run(test())
