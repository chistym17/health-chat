"""
Voice Router for Daily.co Pipecat Integration
Handles voice bot connections and room management
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from typing import Dict, Any
import os
import subprocess
import asyncio
import aiohttp
from dotenv import load_dotenv
from pipecat.transports.services.helpers.daily_rest import DailyRESTHelper

load_dotenv(override=True)

router = APIRouter()

# Global state for bot management
bot_procs = {}
prewarmed_bot_proc = None
prewarmed_room_url = None
prewarmed_token = None
daily_helpers = {}
aiohttp_session = None

def cleanup():
    """Clean up bot processes"""
    global prewarmed_bot_proc
    
    if prewarmed_bot_proc:
        prewarmed_bot_proc.terminate()
        prewarmed_bot_proc.wait()
        prewarmed_bot_proc = None
    
    for entry in bot_procs.values():
        proc = entry[0]
        proc.terminate()
        proc.wait()

def get_bot_file():
    """Get the bot file path"""
    return "voice_live_agent"

async def get_prebuilt_room_and_token() -> tuple[str, str]:
    """Get pre-built room URL and token from environment"""
    room_url = os.getenv("DAILY_PREBUILT_ROOM_URL")
    token = os.getenv("DAILY_PREBUILT_ROOM_TOKEN")
    
    if not room_url or not token:
        raise HTTPException(
            status_code=500, 
            detail="Pre-built room URL or token not configured. Please set DAILY_PREBUILT_ROOM_URL and DAILY_PREBUILT_ROOM_TOKEN in environment variables."
        )
    
    return room_url, token

async def start_prewarmed_bot():
    """Start the pre-warmed bot process"""
    global prewarmed_bot_proc, prewarmed_room_url, prewarmed_token
    
    print("Starting pre-warmed bot...")
    room_url, token = await get_prebuilt_room_and_token()
    prewarmed_room_url = room_url
    prewarmed_token = token
    
    try:
        bot_file = get_bot_file()
        proc = subprocess.Popen(
            [f"python3 -m {bot_file}"],
            shell=True,
            bufsize=1,
            cwd=os.path.dirname(os.path.abspath(__file__)),
        )
        prewarmed_bot_proc = proc
        print(f"Pre-warmed bot started with PID: {proc.pid}")
        print(f"Room URL: {room_url}")
        
        await asyncio.sleep(3)
        
    except Exception as e:
        print(f"Failed to start pre-warmed bot: {e}")
        raise

@router.get("/voice/")
async def start_agent(request: Request):
    """Redirect to Daily room"""
    global prewarmed_room_url, prewarmed_token
    
    if not prewarmed_room_url or not prewarmed_token:
        raise HTTPException(status_code=500, detail="Pre-warmed bot not ready")
    
    print(f"User connecting to pre-warmed room: {prewarmed_room_url}")
    return RedirectResponse(prewarmed_room_url)

@router.post("/voice/connect")
async def rtvi_connect(request: Request) -> Dict[Any, Any]:
    """Get room connection details"""
    global prewarmed_room_url, prewarmed_token
    
    if not prewarmed_room_url or not prewarmed_token:
        raise HTTPException(status_code=500, detail="Pre-warmed bot not ready")
    
    print(f"User connecting to pre-warmed room: {prewarmed_room_url}")
    return {"room_url": prewarmed_room_url, "token": prewarmed_token}

@router.get("/voice/status")
def get_bot_status():
    """Get bot status"""
    global prewarmed_bot_proc, prewarmed_room_url
    
    if not prewarmed_bot_proc:
        return JSONResponse({"status": "not_started", "message": "Bot not started"})
    
    status = "running" if prewarmed_bot_proc.poll() is None else "finished"
    return JSONResponse({
        "status": status, 
        "pid": prewarmed_bot_proc.pid,
        "room_url": prewarmed_room_url
    })

@router.get("/voice/status/{pid}")
def get_status(pid: int):
    """Get status of specific bot process"""
    proc = bot_procs.get(pid)

    if not proc:
        raise HTTPException(status_code=404, detail=f"Bot with process id: {pid} not found")

    status = "running" if proc[0].poll() is None else "finished"
    return JSONResponse({"bot_id": pid, "status": status})

# Initialize function - call this from main.py startup
async def initialize_voice_bot():
    """Initialize the voice bot system"""
    global aiohttp_session, daily_helpers
    
    aiohttp_session = aiohttp.ClientSession()
    daily_helpers["rest"] = DailyRESTHelper(
        daily_api_key=os.getenv("DAILY_API_KEY", ""),
        daily_api_url=os.getenv("DAILY_API_URL", "https://api.daily.co/v1"),
        aiohttp_session=aiohttp_session,
    )
    
    await start_prewarmed_bot()

# Cleanup function - call this from main.py shutdown
async def cleanup_voice_bot():
    """Clean up the voice bot system"""
    global aiohttp_session
    
    if aiohttp_session:
        await aiohttp_session.close()
    cleanup() 