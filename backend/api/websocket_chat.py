from fastapi import WebSocket, WebSocketDisconnect
from workflows.proccess_workflow import process_workflow
from workflows.query_transformation_workflow import query_transformation_workflow
from workflows.websearch_workflow import websearch_workflow
from utils.rrf_ranking import get_top_results
from agents.diagnosis_agent import DiagnosisAgent
from workflows.retrieval_workflow import retrieval_workflow

diagnosis_agent = DiagnosisAgent()

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
                query_transform_result = await query_transformation_workflow.ainvoke({"text": user_text})
                transformed_query = query_transform_result.get("search_query", "")
                symptoms = query_transform_result.get("symptoms", [])

                vector_results = await retrieval_workflow.ainvoke(transformed_query)

                web_results = await websearch_workflow.ainvoke({"query": transformed_query})

                structured_results = get_top_results(
                    vector_results=vector_results,
                    web_results=web_results,
                    top_k=3
                )


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