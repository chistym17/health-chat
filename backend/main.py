from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os
import assemblyai as aai
import uvicorn
from demo_router import router as demo_router
from voice_router import router as voice_router, initialize_voice_bot, cleanup_voice_bot
import logging

from api.router import router as api_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

app = FastAPI(
    title="Healia - Voice-Powered AI Health Consultant",
    description="A voice-powered AI health consultant with Pipecat integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(api_router, prefix="/api", tags=["API"])
app.include_router(demo_router, tags=["Demo"])
app.include_router(voice_router, tags=["Voice Bot"])

# Serve static files
app.mount("/static", StaticFiles(directory="."), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("Starting Healia backend...")
    try:
        await initialize_voice_bot()
        logger.info("Voice bot initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize voice bot: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    logger.info("Shutting down Healia backend...")
    try:
        await cleanup_voice_bot()
        logger.info("Voice bot cleaned up successfully")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Healia - Voice-Powered AI Health Consultant",
        "version": "1.0.0",
        "endpoints": {
            "voice_bot": "/voice/",
            "voice_connect": "/voice/connect",
            "voice_status": "/voice/status",
            "demo": "/api/demo",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "healia-backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
