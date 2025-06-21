from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import shutil
import assemblyai as aai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from workflows.proccess_workflow import process_workflow
from workflows.query_transformation_workflow import query_transformation_workflow
from workflows.websearch_workflow import websearch_workflow
from utils.rrf_ranking import get_top_results
import uvicorn

from agents.classifier_agent import ClassifierAgent
from agents.diagnosis_agent import DiagnosisAgent
from workflows.retrieval_workflow import retrieval_workflow  


load_dotenv()
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app = FastAPI()

classifier_agent = ClassifierAgent()
diagnosis_agent = DiagnosisAgent()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            user_text = data.get("text")

            if not user_text:
                await websocket.send_json({"error": "No input received."})
                continue

            classification_result = await process_workflow.ainvoke({"text": user_text})
            status = classification_result.get("status")

            if status == "warning":
                await websocket.send_json({
                    "type": "info",
                    "message": classification_result.get("message", "This query does not appear to be health related.")
                })

            elif status == "followup":
                await websocket.send_json({
                    "type": "followup",
                    "message": "I need a bit more info to help you. Please answer:",
                    "questions": classification_result.get("questions", [])
                })

            elif status == "completed":
                # Step 1: Run query transformation workflow
                query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
                transformed_query = query_transform_result.get("search_query", "")
                symptoms = query_transform_result.get("symptoms", [])

                # Step 2: Run retrieval workflow with transformed query
                vector_results = await retrieval_workflow.ainvoke(transformed_query)
                # Vector results are already in structured format from FAISS

                # Step 3: Run websearch workflow
                web_results = await websearch_workflow.ainvoke({"query": transformed_query})

                # Step 4: Combine and rank results using RRF
                structured_results = get_top_results(
                    vector_results=vector_results,
                    web_results=web_results,
                    top_k=3
                )

                print(structured_results)

       

                # Step 6: Generate diagnosis
                print(structured_results)
                diagnosis = diagnosis_agent.run(user_symptoms=user_text, chunks=structured_results)

                await websocket.send_json({
                    "type": "diagnosis",
                    "message": diagnosis,
                    "query_transformation": {
                        "symptoms": symptoms,
                        "search_query": transformed_query
                    },
                    "web_results": web_results,
                    "structured_results": structured_results
                })

            else:
                await websocket.send_json({
                    "type": "error",
                    "message": classification_result.get("message", "An unknown error occurred.")
                })

    except WebSocketDisconnect:
        print("WebSocket disconnected.")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)








@app.post("/transcribe")
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
