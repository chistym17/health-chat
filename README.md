##  Healia – Voice-Powered AI Health Consultant

## Inspiration
We were inspired by the idea of making healthcare advice more accessible and inclusive, especially for those who may find typing or navigating apps difficult. Voice is the most natural way to communicate — so we created Healia, a voice-powered AI health consultant that listens to your symptoms and provides smart, AI-driven suggestions.

## What It Does
Healia allows users to:

🎙️ Speak their symptoms using voice input

🧠 Analyze their input using AI for understanding and response

🔍 Provide accurate health suggestions and trusted resources

🌐 Fetch relevant real-time results from the web

In the future, Healia will also respond back using voice, creating a two-way AI health conversation.

## How We Built It
### Tech Stack
Frontend: React.js

Backend: Python with FastAPI

Speech-to-Text:

Tested: OpenAI Whisper, ElevenLabs

Chosen: AssemblyAI for its accuracy and API simplicity

AI Reasoning: LangChain + Gemini AI

Vector Search: FAISS for semantic symptom matching

Web Search: Travily for live medical resource fetching

## What We Learned
How to build a voice-based interface using speech recognition

Implementing semantic vector search with FAISS

Using LangChain to orchestrate reasoning with Gemini AI

Filtering and verifying AI output for medical relevance and accuracy

Building a multi-stage pipeline involving voice, AI, and web search

## Challenges We Faced
Collecting and structuring accurate health-related data

Ensuring AI provides reliable and relevant suggestions

Connecting all components (voice, vector DB, AI, web search) into a smooth pipeline

## Accomplishments We're Proud Of
Successfully integrated voice input, FAISS, LangChain, Gemini AI, and web search

Built a working demo that accepts voice and gives back tailored health suggestions

Designed a clean UI with React.js that’s easy for users to interact with

Created a strong foundation for building a fully conversational AI assistant

##  What's Next for Healia
🗣️ Add voice-based AI replies (using ElevenLabs or similar)

💬 Make it fully conversational with memory and history tracking

🌍 Enable multi-language support

📈 Improve with real user feedback and more medical datasets

🔒 Ensure better privacy and security for handling voice data

🎯 Final Thought
Healia is just the beginning of a future where AI can assist users in a natural, friendly, and voice-driven way. We're excited to continue building a product that makes basic healthcare more accessible — one voice at a time. 💙
