"""
Demo Voice Router
Handles demo voice processing by ID and runs through the same workflow as regular chat
"""

from fastapi import WebSocket, WebSocketDisconnect
from utils.demo_voices import get_demo_voice_by_id, validate_demo_voice_id
from workflows.query_transformation_workflow import query_transformation_workflow
from workflows.retrieval_workflow import retrieval_workflow
from workflows.websearch_workflow import websearch_workflow
from utils.rrf_ranking import get_top_results
from agents.diagnosis_agent import DiagnosisAgent

async def handle_demo_voice(websocket: WebSocket, demo_voice_id: str):
    print(f"[DEMO] Received request for demo_voice_id: {demo_voice_id}")

    if not validate_demo_voice_id(demo_voice_id):
        print(f"[DEMO][ERROR] Invalid demo voice ID: {demo_voice_id}")
        await websocket.send_json({
            "type": "error",
            "message": f"Invalid demo voice ID: {demo_voice_id}"
        })
        return
    
    demo_voice = get_demo_voice_by_id(demo_voice_id)
    if not demo_voice:
        print(f"[DEMO][ERROR] Demo voice not found: {demo_voice_id}")
        await websocket.send_json({
            "type": "error", 
            "message": f"Demo voice not found: {demo_voice_id}"
        })
        return
    
    user_text = demo_voice.transcript
    print(f"[DEMO] Processing transcript for {demo_voice.speaker}: {user_text}")
    
    try:
        await websocket.send_json({
            "type": "demo_processing",
            "message": f"Processing demo voice from {demo_voice.speaker}...",
            "demo_info": {
                "voice_id": demo_voice.voice_id,
                "speaker": demo_voice.speaker,
                "symptoms": demo_voice.symptoms
            }
        })
        print(f"[DEMO] Starting query transformation workflow...")
        query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
        transformed_query = query_transform_result.get("search_query", "")
        symptoms = query_transform_result.get("symptoms", [])
        print(f"[DEMO] Query transformation result: {transformed_query}, symptoms: {symptoms}")
        
        print(f"[DEMO] Starting vector retrieval workflow...")
        vector_results = await retrieval_workflow.ainvoke(transformed_query)
        print(f"[DEMO] Vector retrieval complete.")
        
        print(f"[DEMO] Starting web search workflow...")
        web_results = await websearch_workflow.ainvoke({"query": transformed_query})
        print(f"[DEMO] Web search complete.")
        
        print(f"[DEMO] Ranking and structuring results...")
        structured_results = get_top_results(
            vector_results=vector_results,
            web_results=web_results,
            top_k=3
        )
        print(f"[DEMO] Structured results ready.")
        
        print(f"[DEMO] Running diagnosis agent...")
        diagnosis = DiagnosisAgent().run(user_symptoms=user_text, chunks=structured_results)
        print(f"[DEMO] Diagnosis complete.")
        
        await websocket.send_json({
            "type": "diagnosis",
            "message": diagnosis,
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
        })
        print(f"[DEMO] Response sent to frontend.")
            
    except Exception as e:
        print(f"[DEMO][ERROR] Exception during demo processing: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "message": f"Error processing demo voice: {str(e)}",
            "demo_info": {
                "voice_id": demo_voice.voice_id,
                "speaker": demo_voice.speaker
            }
        })

async def demo_websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for demo voice processing
    """
    await websocket.accept()
    print("[DEMO] WebSocket connection accepted.")
    
    try:
        while True:
            data = await websocket.receive_json()
            demo_voice_id = data.get("demo_voice_id")
            print(f"[DEMO] Received data: {data}")
            
            if not demo_voice_id:
                print("[DEMO][ERROR] No demo voice ID received.")
                await websocket.send_json({
                    "type": "error",
                    "message": "No demo voice ID received."
                })
                continue
            
            await handle_demo_voice(websocket, demo_voice_id)
            
    except WebSocketDisconnect:
        print("[DEMO] Demo WebSocket disconnected.")
    except Exception as e:
        print(f"[DEMO][ERROR] Error in demo WebSocket: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"WebSocket error: {str(e)}"
            })
        except:
            pass 