from langchain_google_genai import ChatGoogleGenerativeAI
from config.config import GOOGLE_API_KEY

def get_gemini_llm():
    return ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY)

