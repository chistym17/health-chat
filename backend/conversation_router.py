"""
Conversation Router for accessing and analyzing conversation data
Provides endpoints for retrieving conversation history and generating health insights
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
import os
import json
from datetime import datetime
from voice_live_agent.conversation_storage import conversation_storage

router = APIRouter()

@router.get("/conversations")
async def get_conversations() -> Dict[Any, Any]:
    """Get all conversation sessions"""
    try:
        sessions = conversation_storage.get_all_sessions()
        return {
            "total_sessions": len(sessions),
            "active_sessions": len(conversation_storage.active_sessions),
            "completed_sessions": len(conversation_storage.conversation_history),
            "sessions": [
                {
                    "session_id": session.session_id,
                    "start_time": session.start_time.isoformat(),
                    "end_time": session.end_time.isoformat() if session.end_time else None,
                    "session_type": session.session_type,
                    "user_id": session.user_id,
                    "message_count": len(session.messages),
                    "summary": session.summary,
                    "has_health_insights": bool(session.health_insights)
                }
                for session in sessions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")

@router.get("/conversations/{session_id}")
async def get_conversation(session_id: str) -> Dict[Any, Any]:
    """Get a specific conversation session"""
    try:
        session = conversation_storage.get_session(session_id) or conversation_storage.get_session_history(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {
            "session_id": session.session_id,
            "start_time": session.start_time.isoformat(),
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "session_type": session.session_type,
            "user_id": session.user_id,
            "summary": session.summary,
            "health_insights": session.health_insights,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_type": msg.message_type,
                    "metadata": msg.metadata
                }
                for msg in session.messages
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")

@router.get("/conversations/{session_id}/text")
async def get_conversation_text(session_id: str) -> Dict[Any, Any]:
    """Get the full conversation text for analysis"""
    try:
        conversation_text = conversation_storage.get_conversation_text(session_id)
        
        if not conversation_text:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {
            "session_id": session_id,
            "conversation_text": conversation_text,
            "length": len(conversation_text)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation text: {str(e)}")

@router.post("/conversations/{session_id}/summary")
async def update_session_summary(session_id: str, request: Request) -> Dict[Any, Any]:
    """Update the session summary"""
    try:
        body = await request.json()
        summary = body.get("summary")
        
        if not summary:
            raise HTTPException(status_code=400, detail="Summary is required")
        
        conversation_storage.update_session_summary(session_id, summary)
        
        return {
            "session_id": session_id,
            "summary": summary,
            "updated": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating summary: {str(e)}")

@router.post("/conversations/{session_id}/health-insights")
async def update_health_insights(session_id: str, request: Request) -> Dict[Any, Any]:
    """Update health insights for a session"""
    try:
        body = await request.json()
        insights = body.get("insights")
        
        if not insights:
            raise HTTPException(status_code=400, detail="Insights are required")
        
        conversation_storage.update_health_insights(session_id, insights)
        
        return {
            "session_id": session_id,
            "insights": insights,
            "updated": True
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating health insights: {str(e)}")

@router.get("/conversations/user/{user_id}")
async def get_user_conversations(user_id: str) -> Dict[Any, Any]:
    """Get all conversations for a specific user"""
    try:
        sessions = conversation_storage.get_user_sessions(user_id)
        
        return {
            "user_id": user_id,
            "total_sessions": len(sessions),
            "sessions": [
                {
                    "session_id": session.session_id,
                    "start_time": session.start_time.isoformat(),
                    "end_time": session.end_time.isoformat() if session.end_time else None,
                    "session_type": session.session_type,
                    "message_count": len(session.messages),
                    "summary": session.summary,
                    "has_health_insights": bool(session.health_insights)
                }
                for session in sessions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user conversations: {str(e)}")

@router.get("/conversations/active")
async def get_active_sessions() -> Dict[Any, Any]:
    """Get all active conversation sessions"""
    try:
        active_sessions = list(conversation_storage.active_sessions.values())
        
        return {
            "active_sessions": len(active_sessions),
            "sessions": [
                {
                    "session_id": session.session_id,
                    "start_time": session.start_time.isoformat(),
                    "session_type": session.session_type,
                    "user_id": session.user_id,
                    "message_count": len(session.messages)
                }
                for session in active_sessions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active sessions: {str(e)}")

@router.delete("/conversations/{session_id}")
async def delete_conversation(session_id: str) -> Dict[Any, Any]:
    """Delete a conversation session (for cleanup)"""
    try:
        # This would need to be implemented in the conversation storage
        # For now, we'll just return a success message
        return {
            "session_id": session_id,
            "deleted": True,
            "message": "Session deletion not yet implemented"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

@router.get("/conversations/stats")
async def get_conversation_stats() -> Dict[Any, Any]:
    """Get conversation statistics"""
    try:
        all_sessions = conversation_storage.get_all_sessions()
        active_sessions = len(conversation_storage.active_sessions)
        completed_sessions = len(conversation_storage.conversation_history)
        
        # Calculate some basic stats
        total_messages = sum(len(session.messages) for session in all_sessions)
        avg_messages_per_session = total_messages / len(all_sessions) if all_sessions else 0
        
        # Session types
        session_types = {}
        for session in all_sessions:
            session_type = session.session_type
            session_types[session_type] = session_types.get(session_type, 0) + 1
        
        return {
            "total_sessions": len(all_sessions),
            "active_sessions": active_sessions,
            "completed_sessions": completed_sessions,
            "total_messages": total_messages,
            "avg_messages_per_session": round(avg_messages_per_session, 2),
            "session_types": session_types,
            "sessions_with_summaries": len([s for s in all_sessions if s.summary]),
            "sessions_with_health_insights": len([s for s in all_sessions if s.health_insights])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}") 