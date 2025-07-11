from fastapi import APIRouter, WebSocket, UploadFile, File
from .websocket_chat import websocket_endpoint
from .audio_processing import process_audio
from .transcription import transcribe

router = APIRouter()

# WebSocket endpoint
@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    return await websocket_endpoint(websocket)

# Audio processing endpoint
@router.post("/api/audio")
async def audio_processing(audio: UploadFile = File(...)):
    return await process_audio(audio)

# Simple transcription endpoint
@router.post("/transcribe")
async def transcription(audio: UploadFile = File(...)):
    return await transcribe(audio) 