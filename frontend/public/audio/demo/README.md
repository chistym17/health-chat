# Demo Audio Files

This directory contains demo audio files for testing the voice input functionality.

## Current Files (Placeholders)

- `joe-fever.mp3` - Joe's fever scenario
- `maria-chest.mp3` - Maria's chest tightness scenario
- `sam-dizzy.mp3` - Sam's dizziness scenario
- `priya-joints.mp3` - Priya's joint pain scenario
- `alex-throat.mp3` - Alex's sore throat scenario

## Generating Real Audio Files

To generate actual audio files, you can use:

1. **Text-to-Speech Services:**

   - Google Cloud Text-to-Speech
   - Amazon Polly
   - Azure Speech Service
   - ElevenLabs

2. **Local TTS:**
   - gTTS (Google Text-to-Speech)
   - pyttsx3
   - espeak

## Example using gTTS:

```bash
pip install gtts
python -c "
from gtts import gTTS
text = 'Hi, I\'m Joe. I haven\'t been feeling well lately. I\'ve had a fever for a few days and feel really tired. I hope it\'s nothing serious. What should I do?'
tts = gTTS(text=text, lang='en', slow=False)
tts.save('joe-fever.mp3')
"
```

## File Requirements:

- Format: MP3 or WAV
- Duration: 10-30 seconds each
- Quality: Clear, natural speech
- Sample Rate: 44.1kHz recommended
