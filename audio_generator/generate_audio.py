#!/usr/bin/env python3
"""
Audio Generator for Demo Voice Files
Generates MP3 files for the demo voice scenarios using gTTS
"""

from gtts import gTTS
import os

# Demo voice data with transcripts
demo_voices = [
    {
        "id": "joe-fever",
        "speaker": "Joe",
        "transcript": "Hi, I'm Joe. I haven't been feeling well lately. I've had a fever for a few days and feel really tired. I hope it's nothing serious. What should I do?"
    },
    {
        "id": "maria-chest", 
        "speaker": "Maria",
        "transcript": "Hello, I'm Maria. My chest feels a bit tight and I'm coughing a lot. I also feel a little anxious about it. Otherwise, my day has been okay."
    },
    {
        "id": "sam-dizzy",
        "speaker": "Sam", 
        "transcript": "Hey, I'm Sam. I've been dizzy and nauseous since this morning. I tried drinking some water and resting, but it hasn't helped much. I'm not sure if I should be worried."
    },
    {
        "id": "priya-joints",
        "speaker": "Priya",
        "transcript": "Hi, I'm Priya. My joints are swollen and painful, especially in the morning. I've also been feeling a bit down lately. I hope you can help."
    },
    {
        "id": "alex-throat",
        "speaker": "Alex",
        "transcript": "Hello, I'm Alex. I have a sore throat and a headache. I've also been sneezing a lot. Other than that, I'm just trying to get through my workday."
    }
]

def generate_audio_files():
    """Generate MP3 files for all demo voices"""
    
    # Create output directory if it doesn't exist
    output_dir = "../frontend/public/audio/demo"
    os.makedirs(output_dir, exist_ok=True)
    
    print("🎵 Generating demo audio files...")
    print(f"📁 Output directory: {output_dir}")
    print("-" * 50)
    
    for i, voice in enumerate(demo_voices, 1):
        print(f"{i}. Generating {voice['id']}.mp3 for {voice['speaker']}...")
        
        try:
            # Create TTS object
            tts = gTTS(text=voice['transcript'], lang='en', slow=False)
            
            # Save the audio file
            output_path = os.path.join(output_dir, f"{voice['id']}.mp3")
            tts.save(output_path)
            
            # Check if file was created successfully
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                print(f"   ✅ Success! File size: {file_size} bytes")
            else:
                print(f"   ❌ Error: File not created")
                
        except Exception as e:
            print(f"   ❌ Error generating {voice['id']}.mp3: {str(e)}")
    
    print("-" * 50)
    print("🎉 Audio generation complete!")
    
    # List all generated files
    print("\n📋 Generated files:")
    for voice in demo_voices:
        file_path = os.path.join(output_dir, f"{voice['id']}.mp3")
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"   • {voice['id']}.mp3 ({file_size} bytes) - {voice['speaker']}")

if __name__ == "__main__":
    generate_audio_files() 