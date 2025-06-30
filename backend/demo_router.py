"""
Demo Voice Router
Handles demo voice processing by ID and runs through the same workflow as regular chat
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.demo_voices import get_demo_voice_by_id, validate_demo_voice_id
from workflows.query_transformation_workflow import query_transformation_workflow
from workflows.retrieval_workflow import retrieval_workflow
from workflows.websearch_workflow import websearch_workflow
from utils.rrf_ranking import get_top_results
from agents.diagnosis_agent import DiagnosisAgent
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

class DemoVoiceRequest(BaseModel):
    demo_voice_id: str

@router.post("/api/demo")
async def process_demo_voice(request: DemoVoiceRequest):
    """
    Process demo voice by ID: get transcript and run through AI workflow
    """
    demo_voice_id = request.demo_voice_id
    logger.info(f"Received request for demo_voice_id: {demo_voice_id}")

    if not validate_demo_voice_id(demo_voice_id):
        logger.error(f"Invalid demo voice ID: {demo_voice_id}")
        raise HTTPException(status_code=400, detail=f"Invalid demo voice ID: {demo_voice_id}")
    
    demo_voice = get_demo_voice_by_id(demo_voice_id)
    if not demo_voice:
        logger.error(f"Demo voice not found: {demo_voice_id}")
        raise HTTPException(status_code=404, detail=f"Demo voice not found: {demo_voice_id}")
    
    user_text = demo_voice.transcript
    logger.info(f"Processing transcript for {demo_voice.speaker}: {user_text}")
    
    try:
        logger.info("Starting query transformation workflow...")
        query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
        transformed_query = query_transform_result.get("search_query", "")
        symptoms = query_transform_result.get("symptoms", [])
        logger.info(f"Query transformation result: {transformed_query}, symptoms: {symptoms}")
        
        logger.info("Starting vector retrieval workflow...")
        vector_results = await retrieval_workflow.ainvoke(transformed_query)
        logger.info("Vector retrieval complete.")
        
        logger.info("Starting web search workflow...")
        web_results = await websearch_workflow.ainvoke({"query": transformed_query})
        logger.info("Web search complete.")
        
        logger.info("Ranking and structuring results...")
        structured_results = get_top_results(
            vector_results=vector_results,
            web_results=web_results,
            top_k=3
        )
        logger.info("Structured results ready.")
        
        logger.info("Running diagnosis agent...")
        diagnosis = DiagnosisAgent().run(user_symptoms=user_text, chunks=structured_results)
        logger.info("Diagnosis complete.")
        
        return {
            "type": "diagnosis",
            "message": diagnosis,
            "transcribed_text": user_text,
            "query_transformation": {
                "symptoms": symptoms,
                "search_query": transformed_query
            },
            "web_results": web_results,
            "structured_results": structured_results,
            "demo_info": {
                "voice_id": demo_voice.voice_id,
                "speaker": demo_voice.speaker,
                "original_transcript": user_text
            }
        }
            
    except Exception as e:
        logger.error(f"Exception during demo processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing demo voice: {str(e)}") 