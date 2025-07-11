
import os
from genai_processors.core import speech_to_text, text_to_speech, text, processor, realtime, rate_limit_audio
from genai_processors import genai_model
from google.genai import types as genai_types

API_KEY = os.environ['GOOGLE_API_KEY']
GOOGLE_PROJECT_ID = os.environ['GOOGLE_PROJECT_ID']

INSTRUCTION_PARTS = [
    'You are an assistant responding in a lively, engaging way. Keep answers short.'
]

def create_genai_pipeline():
    stt = speech_to_text.SpeechToText(
        project_id=GOOGLE_PROJECT_ID,
        with_interim_results=True,
    )

    genai = genai_model.GenaiModel(
        api_key=API_KEY,
        model_name='gemini-2.0-flash-lite',
        generate_content_config=genai_types.GenerateContentConfig(
            system_instruction=INSTRUCTION_PARTS,
            response_modalities=['TEXT'],
            tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())],
        ),
        http_options=genai_types.HttpOptions(api_version='v1alpha'),
    )

    tts = text_to_speech.TextToSpeech(
        project_id=GOOGLE_PROJECT_ID,
       
    ) + rate_limit_audio.RateLimitAudio(
        sample_rate=24000,
        delay_other_parts=True,
    )

    pipeline = (
        stt
        + realtime.LiveModelProcessor(turn_processor=genai + tts)
    )

    return pipeline
