"""
Demo Voice Data Utility
Contains demo voice scenarios with IDs for backend processing
"""

from typing import Dict, List, Optional

class DemoVoice:
    def __init__(self, voice_id: str, speaker: str, transcript: str, symptoms: List[str] = None):
        self.voice_id = voice_id
        self.speaker = speaker
        self.transcript = transcript
        self.symptoms = symptoms or []

DEMO_VOICES = {
    "joe_fever_001": DemoVoice(
        voice_id="joe_fever_001",
        speaker="Joe",
        transcript="Hi, I'm Joe. I haven't been feeling well lately. I've had a fever for a few days and feel really tired. I hope it's nothing serious. What should I do?",
        symptoms=["fever", "fatigue", "tiredness"]
    ),
    
    "maria_chest_002": DemoVoice(
        voice_id="maria_chest_002", 
        speaker="Maria",
        transcript="Hello, I'm Maria. My chest feels a bit tight and I'm coughing a lot. I also feel a little anxious about it. Otherwise, my day has been okay.",
        symptoms=["chest tightness", "coughing", "anxiety"]
    ),
    
    "sam_dizzy_003": DemoVoice(
        voice_id="sam_dizzy_003",
        speaker="Sam", 
        transcript="Hey, I'm Sam. I've been dizzy and nauseous since this morning. I tried drinking some water and resting, but it hasn't helped much. I'm not sure if I should be worried.",
        symptoms=["dizziness", "nausea", "dehydration"]
    ),
    
    "priya_joints_004": DemoVoice(
        voice_id="priya_joints_004",
        speaker="Priya",
        transcript="Hi, I'm Priya. My joints are swollen and painful, especially in the morning. I've also been feeling a bit down lately. I hope you can help.",
        symptoms=["joint pain", "swelling", "depression"]
    ),
    
    "alex_throat_005": DemoVoice(
        voice_id="alex_throat_005",
        speaker="Alex",
        transcript="Hello, I'm Alex. I have a sore throat and a headache. I've also been sneezing a lot. Other than that, I'm just trying to get through my workday.",
        symptoms=["sore throat", "headache", "sneezing"]
    )
}

def get_demo_voice_by_id(voice_id: str) -> Optional[DemoVoice]:
    """
    Get a demo voice by its ID
    
    Args:
        voice_id (str): The unique ID of the demo voice
        
    Returns:
        DemoVoice or None: The demo voice object if found, None otherwise
    """
    return DEMO_VOICES.get(voice_id)

def get_all_demo_voices() -> List[DemoVoice]:
    """
    Get all available demo voices
    
    Returns:
        List[DemoVoice]: List of all demo voice objects
    """
    return list(DEMO_VOICES.values())

def get_demo_voices_by_symptom(symptom: str) -> List[DemoVoice]:
    """
    Get demo voices that contain a specific symptom
    
    Args:
        symptom (str): The symptom to search for
        
    Returns:
        List[DemoVoice]: List of demo voices containing the symptom
    """
    matching_voices = []
    symptom_lower = symptom.lower()
    
    for voice in DEMO_VOICES.values():
        if any(symptom_lower in s.lower() for s in voice.symptoms):
            matching_voices.append(voice)
    
    return matching_voices

def get_demo_voice_ids() -> List[str]:
    """
    Get all available demo voice IDs
    
    Returns:
        List[str]: List of all demo voice IDs
    """
    return list(DEMO_VOICES.keys())

def validate_demo_voice_id(voice_id: str) -> bool:
    """
    Check if a demo voice ID is valid
    
    Args:
        voice_id (str): The ID to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    return voice_id in DEMO_VOICES

