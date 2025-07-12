"""
RTVI Router for Pipecat Real-Time Voice Interface
Handles RTVI connections and provides the endpoints expected by the RTVI client
"""

from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import os
import json
import asyncio
import logging
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter()
logger = logging.getLogger(__name__)

# Store active connections
active_connections: List[WebSocket] = []

@router.options("/connect")
async def connect_options():
    """Handle OPTIONS request for CORS preflight"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

@router.post("/connect")
async def rtvi_connect(request: Request) -> Dict[Any, Any]:
    """RTVI connect endpoint - returns connection details"""
    try:
        # Get the room URL and token from environment or generate them
        room_url = os.getenv("DAILY_PREBUILT_ROOM_URL")
        token = os.getenv("DAILY_PREBUILT_ROOM_TOKEN")
        
        if not room_url or not token:
            # Fallback to default values for testing
            room_url = "https://healia.daily.co/voice-chat"
            token = "test-token"
            logger.warning("Using fallback room URL and token for RTVI connection")
        
        logger.info(f"RTVI connection requested - Room: {room_url}")
        
        return {
            "room_url": room_url,
            "token": token,
            "status": "ready"
        }
    except Exception as e:
        logger.error(f"Error in RTVI connect: {e}")
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")

@router.get("/status")
async def rtvi_status():
    """RTVI status endpoint"""
    return {
        "status": "ready",
        "connections": len(active_connections),
        "service": "rtvi"
    }

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for RTVI real-time communication"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back for now - in a real implementation, you'd process the message
            await websocket.send_text(json.dumps({
                "type": "echo",
                "data": message
            }))
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)

@router.get("/health")
async def rtvi_health():
    """RTVI health check endpoint"""
    return {
        "status": "healthy",
        "service": "rtvi",
        "active_connections": len(active_connections)
    } 