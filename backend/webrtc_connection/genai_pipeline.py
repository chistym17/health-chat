
import os
import logging
import asyncio
from typing import Optional

from google.genai import types as genai_types
from genai_processors.core import speech_to_text, text_to_speech, realtime, rate_limit_audio
from genai_processors import genai_model        

from webrtc_connection.error_handler import ErrorHandler, with_error_handling, PipelineError
from prompts.prompts import WEBRTC_HEALTH_CONVERSATION_PROMPT

logger = logging.getLogger(__name__)

API_KEY = os.environ.get('GOOGLE_API_KEY')
GOOGLE_PROJECT_ID = os.environ.get('GOOGLE_PROJECT_ID')

if not API_KEY or not GOOGLE_PROJECT_ID:
    logger.error("Missing required environment variables: GOOGLE_API_KEY or GOOGLE_PROJECT_ID")

def create_genai_pipeline():
    """
    Create a health-focused AI pipeline for real-time conversation using Google's genai_processors
    """
    try:
      
        
        logger.info("Creating health-focused AI pipeline with genai_processors")
        
        stt = speech_to_text.SpeechToText(
            project_id=GOOGLE_PROJECT_ID,
            with_interim_results=True,
        )

        genai = genai_model.GenaiModel(
            api_key=API_KEY,
            model_name='gemini-2.0-flash-lite',
            generate_content_config=genai_types.GenerateContentConfig(
                system_instruction=WEBRTC_HEALTH_CONVERSATION_PROMPT,
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
        
    except ImportError as e:
        logger.error(f"Failed to import genai_processors: {e}")
        logger.error("Please install genai_processors: pip install genai-processors")
        raise PipelineError(f"genai_processors not available: {e}")
    except Exception as e:
        logger.error(f"Failed to create AI pipeline: {e}")
        raise PipelineError(f"Pipeline creation failed: {e}")

