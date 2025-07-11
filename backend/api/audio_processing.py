from fastapi import UploadFile, File, HTTPException
import os
import shutil
import assemblyai as aai
from workflows.proccess_workflow import process_workflow
from workflows.query_transformation_workflow import query_transformation_workflow
from workflows.websearch_workflow import websearch_workflow
from utils.rrf_ranking import get_top_results
from agents.diagnosis_agent import DiagnosisAgent
from workflows.retrieval_workflow import retrieval_workflow
import logging

logger = logging.getLogger(__name__)
diagnosis_agent = DiagnosisAgent()

async def process_audio(audio: UploadFile = File(...)):
    """
    Process real audio from frontend: transcribe and run through AI workflow
    """
    logger.info(f"Received audio file: {audio.filename}, size: {audio.size} bytes")
    
    if not audio:
        logger.error("No audio file provided")
        raise HTTPException(status_code=400, detail="No audio file provided")

    # Save audio to temporary file
    temp_path = f"temp_{audio.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        logger.info(f"Audio saved to temporary file: {temp_path}")
    except Exception as e:
        logger.error(f"Failed to save audio file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")

    try:
        # Step 1: Transcribe audio
        logger.info("Starting audio transcription...")
        config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.best)
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(temp_path)

        if transcript.status == "error":
            logger.error(f"Transcription failed: {transcript.error}")
            raise HTTPException(status_code=500, detail=f"Transcription failed: {transcript.error}")

        transcribed_text = transcript.text
        logger.info(f"Transcription successful. Text: '{transcribed_text}'")

        # Step 2: Process through AI workflow
        logger.info("Starting AI workflow processing...")
        
        # Classification
        logger.info("Running classification...")
        classification_result = await process_workflow.ainvoke({"text": transcribed_text})
        status = classification_result.get("status")
        logger.info(f"Classification status: {status}")

        if status == "warning":
            logger.info("Query classified as non-health related")
            return {
                "type": "info",
                "message": classification_result.get("message", "This query does not appear to be health related."),
                "transcribed_text": transcribed_text
            }

        elif status == "followup":
            logger.info("Query requires followup questions")
            return {
                "type": "followup",
                "message": "please ask question related to health",
                "questions": classification_result.get("questions", []),
                "transcribed_text": transcribed_text
            }

        elif status == "completed":
            logger.info("Query classified as health-related, proceeding with diagnosis...")
            
            # Query transformation
            logger.info("Running query transformation...")
            query_transform_result = await query_transformation_workflow.ainvoke({"text": transcribed_text})
            transformed_query = query_transform_result.get("search_query", "")
            symptoms = query_transform_result.get("symptoms", [])
            logger.info(f"Transformed query: '{transformed_query}', Symptoms: {symptoms}")

            # Vector search
            logger.info("Running vector search...")
            vector_results = await retrieval_workflow.ainvoke(transformed_query)
            logger.info(f"Vector search completed, found {len(vector_results)} results")

            # Web search
            logger.info("Running web search...")
            web_results = await websearch_workflow.ainvoke({"query": transformed_query})
            logger.info(f"Web search completed, found {len(web_results)} results")

            # Get top results
            structured_results = get_top_results(
                vector_results=vector_results,
                web_results=web_results,
                top_k=3
            )
            logger.info(f"Combined top results: {len(structured_results)} items")

            # Generate diagnosis
            logger.info("Generating diagnosis...")
            diagnosis = diagnosis_agent.run(user_symptoms=transcribed_text, chunks=structured_results)
            logger.info("Diagnosis generated successfully")

            return {
                "type": "diagnosis",
                "message": diagnosis,
                "transcribed_text": transcribed_text,
                "query_transformation": {
                    "symptoms": symptoms,
                    "search_query": transformed_query
                },
                "web_results": web_results,
                "structured_results": structured_results
            }

        else:
            logger.error(f"Unknown classification status: {status}")
            return {
                "type": "error",
                "message": classification_result.get("message", "An unknown error occurred."),
                "transcribed_text": transcribed_text
            }

    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"Cleaned up temporary file: {temp_path}") 