import asyncio
import json
import logging
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.signaling import BYE

from .webrtc_audio import WebRTCAudioInputProcessor
from .genai_pipeline import create_genai_pipeline
from .tts_output import TTSOutputTrack
from .connection_manager import ConnectionManager, ConnectionState
from .error_handler import ErrorHandler, with_error_handling, ConnectionError, PipelineError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class Offer(BaseModel):
    sdp: str
    type: str

connection_manager = ConnectionManager(max_connections=10)
error_handler = ErrorHandler()

@router.on_event("startup")
async def startup_event():
    """Initialize connection manager on startup"""
    await connection_manager.start()
    logger.info("WebRTC router started")

@router.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await connection_manager.stop()
    logger.info("WebRTC router stopped")

@router.post("/offer")
@with_error_handling(error_handler, "connection")
async def offer(request: Request, offer: Offer):
    """Handle WebRTC offer with improved error handling and connection management"""
    try:
        pc = RTCPeerConnection()
        user_agent = request.headers.get("user-agent", "unknown")
        
        conn_id = await connection_manager.add_connection(pc, user_agent)
        logger.info(f"Created new peer connection: {conn_id}")

        tts_track = TTSOutputTrack()
        
        try:
            genai_pipeline = create_genai_pipeline()
        except Exception as e:
            logger.error(f"Failed to create AI pipeline: {e}")
            await connection_manager.remove_connection(conn_id)
            raise HTTPException(status_code=500, detail="Failed to initialize AI pipeline")

        @pc.on("track")
        async def on_track(track: MediaStreamTrack):
            """Handle incoming media tracks"""
            try:
                if track.kind == "audio":
                    logger.info(f"Received audio track for connection: {conn_id}")
                    
                    input_processor = WebRTCAudioInputProcessor(track)
                    
                    await connection_manager.update_connection_state(conn_id, ConnectionState.CONNECTED)

                    async def feed_genai_input():
                        """Feed audio input to AI pipeline"""
                        try:
                            async for audio_chunk in input_processor.audio_frame_generator():
                                if genai_pipeline:
                                    await genai_pipeline.feed(audio_chunk)
                        except Exception as e:
                            logger.error(f"Error in feed_genai_input for {conn_id}: {e}")
                            await error_handler.handle_pipeline_error(e, f"feed_{conn_id}")

                    async def run_pipeline():
                        """Run AI pipeline and send output to TTS"""
                        try:
                            if genai_pipeline:
                                async for part in genai_pipeline:
                                    if part.mimetype == "audio/wav":
                                        success = await tts_track.send_audio(part.data)
                                        if not success:
                                            logger.warning(f"Failed to send audio for {conn_id}")
                        except Exception as e:
                            logger.error(f"Error in run_pipeline for {conn_id}: {e}")
                            await error_handler.handle_pipeline_error(e, f"pipeline_{conn_id}")

                    feed_task = asyncio.create_task(feed_genai_input())
                    pipeline_task = asyncio.create_task(run_pipeline())
                    
                    pc._processing_tasks = [feed_task, pipeline_task]
                    
            except Exception as e:
                logger.error(f"Error handling track for {conn_id}: {e}")
                await connection_manager.update_connection_state(conn_id, ConnectionState.ERROR)

        @pc.on("connectionstatechange")
        async def on_connection_state_change():
            """Handle connection state changes"""
            try:
                state_map = {
                    "new": ConnectionState.CONNECTING,
                    "connecting": ConnectionState.CONNECTING,
                    "connected": ConnectionState.CONNECTED,
                    "disconnected": ConnectionState.DISCONNECTED,
                    "failed": ConnectionState.ERROR,
                    "closed": ConnectionState.DISCONNECTED
                }
                
                new_state = state_map.get(pc.connectionState, ConnectionState.ERROR)
                await connection_manager.update_connection_state(conn_id, new_state)
                
                if new_state in [ConnectionState.ERROR, ConnectionState.DISCONNECTED]:
                    if hasattr(pc, '_processing_tasks'):
                        for task in pc._processing_tasks:
                            task.cancel()
                    
                    await tts_track.stop()
                    
                    logger.info(f"Connection {conn_id} state changed to: {new_state.value}")
                    
            except Exception as e:
                logger.error(f"Error in connection state change handler: {e}")

        pc.addTrack(tts_track)

        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=offer.sdp, type=offer.type)
        )
        
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        logger.info(f"Sent SDP answer for connection: {conn_id}")

        return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        
    except Exception as e:
        logger.error(f"Error in offer handler: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get WebRTC connection status"""
    try:
        active_connections = await connection_manager.get_active_connections()
        error_stats = await error_handler.get_error_stats()
        
        return {
            "total_connections": connection_manager.connection_count,
            "active_connections": connection_manager.active_connection_count,
            "max_connections": connection_manager.max_connections,
            "error_stats": error_stats
        }
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
