from fastapi import UploadFile, File, HTTPException
import os
import shutil
import assemblyai as aai

async def transcribe(audio: UploadFile = File(...)):
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file provided")

    temp_path = f"temp_{audio.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    try:
        config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.best)

        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(temp_path)

        if transcript.status == "error":
            raise HTTPException(status_code=500, detail=f"Transcription failed: {transcript.error}")

        return {"text": transcript.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path) 