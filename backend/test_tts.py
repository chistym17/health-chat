"""
Test script for TTS service
"""

import asyncio
import base64
import os
from utils.tts_service import convert_text_to_speech

async def test_tts():
    """Test the TTS service with a sample text"""
    
    test_text = "Hello! I'm your AI health assistant. How can I help you today?"
    
    print("Testing TTS service...")
    print(f"Input text: {test_text}")
    
    try:
        # Convert text to speech
        base64_audio, duration = await convert_text_to_speech(test_text, 'en')
        
        print(f"✅ TTS conversion successful!")
        print(f"Audio duration (estimated): {duration:.2f} seconds")
        print(f"Base64 audio length: {len(base64_audio)} characters")
        
        # Save audio file for testing
        audio_data = base64.b64decode(base64_audio)
        with open("test_output.mp3", "wb") as f:
            f.write(audio_data)
        
        print("✅ Audio file saved as 'test_output.mp3'")
        
        # Test with empty text
        print("\nTesting with empty text...")
        base64_audio_empty, duration_empty = await convert_text_to_speech("", 'en')
        print(f"Empty text result: base64_length={len(base64_audio_empty)}, duration={duration_empty}")
        
    except Exception as e:
        print(f"❌ TTS test failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_tts()) 