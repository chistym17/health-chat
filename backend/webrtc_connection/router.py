import asyncio
import json
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.signaling import BYE

from webrtc_connection.webrtc_audio import WebRTCAudioInputProcessor
from webrtc_connection.genai_pipeline import create_genai_pipeline
from webrtc_connection.tts_output import TTSOutputTrack
from utils import setup_logger

from genai_processors.core import text


logger = setup_logger(__name__)
router = APIRouter()

class Offer(BaseModel):
    sdp: str
    type: str

peer_connections = set()

@router.post("/offer")
async def offer(request: Request, offer: Offer):
    pc = RTCPeerConnection()
    peer_connections.add(pc)
    logger.info("Created new peer connection")

    tts_track = TTSOutputTrack()

    genai_pipeline = create_genai_pipeline()

    @pc.on("track")
    async def on_track(track: MediaStreamTrack):

        if track.kind == "audio":
            input_processor = WebRTCAudioInputProcessor(track)

            async def feed_genai_input():
                try:
                    async for audio_chunk in input_processor.audio_frame_generator():
                        await genai_pipeline.feed(audio_chunk)
                except Exception as e:
                    logger.error(f"Error in feed_genai_input: {e}")

            asyncio.create_task(feed_genai_input())

            async def run_pipeline():
                try:
                    async for part in genai_pipeline(text.terminal_input()):
                        if part.mimetype == "audio/wav":
                            await tts_track.send_audio(part.data)
                except Exception as e:
                    logger.error(f"Error in run_pipeline: {e}")

            asyncio.create_task(run_pipeline())

    pc.addTrack(tts_track)

    await pc.setRemoteDescription(
        RTCSessionDescription(sdp=offer.sdp, type=offer.type)
    )
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    logger.info("Sent SDP answer")

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
