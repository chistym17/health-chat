import os
import base64
import tempfile
import logging
from gtts import gTTS
from typing import Optional, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class TTSService:
    def __init__(self, language: str = 'en', tld: str = 'com'):
     
        self.language = language
        self.tld = tld
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def text_to_speech(self, text: str, language: Optional[str] = None) -> Tuple[str, float]:
   
        if not text or text.strip() == "":
            logger.warning("Empty text provided for TTS conversion")
            return "", 0.0
            
        try:
            logger.info(f"Starting TTS conversion for text: {text[:100]}...")
            
            lang = language or self.language
            
            loop = asyncio.get_event_loop()
            base64_audio, duration = await loop.run_in_executor(
                self.executor, 
                self._convert_text_to_speech, 
                text, 
                lang
            )
            
            logger.info(f"TTS conversion completed. Duration: {duration:.2f}s")
            return base64_audio, duration
            
        except Exception as e:
            logger.error(f"Error in TTS conversion: {str(e)}")
            raise Exception(f"TTS conversion failed: {str(e)}")
    
    def _convert_text_to_speech(self, text: str, language: str) -> Tuple[str, float]:
        """
        Synchronous method to convert text to speech
        
        Args:
            text: Text to convert
            language: Language code
            
        Returns:
            Tuple of (base64_audio, duration_seconds)
        """
        temp_file = None
        try:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            temp_path = temp_file.name
            temp_file.close()
            
            tts = gTTS(text=text, lang=language, tld=self.tld)
            tts.save(temp_path)
            
            with open(temp_path, 'rb') as audio_file:
                audio_data = audio_file.read()
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            word_count = len(text.split())
            estimated_duration = (word_count / 150) * 60  
            
            return base64_audio, estimated_duration
            
        except Exception as e:
            logger.error(f"Error in _convert_text_to_speech: {str(e)}")
            raise e
            
        finally:
            if temp_file and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up temp file {temp_path}: {str(e)}")
    
    def get_supported_languages(self) -> list:
        """
        Get list of supported languages
        
        Returns:
            List of supported language codes
        """
        return [
            'en',  # English
            'es',  # Spanish
            'fr',  # French
            'de',  # German
            'it',  # Italian
            'pt',  # Portuguese
            'ru',  # Russian
            'ja',  # Japanese
            'ko',  # Korean
            'zh',  # Chinese
            'hi',  # Hindi
            'ar',  # Arabic
        ]
    
    def validate_language(self, language: str) -> bool:
        """
        Validate if language is supported
        
        Args:
            language: Language code to validate
            
        Returns:
            True if supported, False otherwise
        """
        return language in self.get_supported_languages()

tts_service = TTSService()

async def convert_text_to_speech(text: str, language: str = 'en') -> Tuple[str, float]:
    """
    Convenience function to convert text to speech
    
    Args:
        text: Text to convert
        language: Language code (default: 'en')
        
    Returns:
        Tuple of (base64_audio, duration_seconds)
    """
    return await tts_service.text_to_speech(text, language) 