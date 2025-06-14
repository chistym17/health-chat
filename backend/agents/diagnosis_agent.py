from llm.gemini_llm import get_gemini_llm
from prompts.prompts import DIAGNOSIS_PROMPT
from langchain_core.messages import HumanMessage

class DiagnosisAgent:
    def __init__(self):
        self.llm = get_gemini_llm()

    def run(self, user_symptoms: str, chunks: list[dict]) -> str:
        formatted_chunks = []
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            content = chunk.get("page_content", "")
            entry = (
                f"Name: {meta.get('name', 'Unknown')}\n"
                f"Code: {meta.get('code', 'N/A')}\n"
                f"Symptoms: {content}\n"
                f"Treatments: {meta.get('treatment', 'Not available')}"
            )
            formatted_chunks.append(entry)

        joined_chunks = "\n\n".join(formatted_chunks)

        prompt = DIAGNOSIS_PROMPT.format(user_symptoms=user_symptoms, chunks=joined_chunks)
        messages = [HumanMessage(content=prompt)]

        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            print(f"Diagnosis Agent Error: {e}")
            return "There was an error generating the diagnosis."

