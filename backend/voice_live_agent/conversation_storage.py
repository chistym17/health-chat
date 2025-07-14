"""
Conversation Storage Module
Stores conversation history in local memory for further diagnosis and analysis
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import uuid

@dataclass
class ConversationMessage:
    """Represents a single message in the conversation"""
    id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    message_type: str = "text"  # 'text', 'transcription', 'ai_response'
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ConversationSession:
    """Represents a complete conversation session"""
    session_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    messages: List[ConversationMessage] = None
    user_id: Optional[str] = None
    session_type: str = "voice_chat"  # 'voice_chat', 'diagnosis', 'consultation'
    summary: Optional[str] = None
    health_insights: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.messages is None:
            self.messages = []

class ConversationStorage:
    """Manages conversation storage in local memory and file system"""
    
    def __init__(self, storage_dir: str = "conversations"):
        self.storage_dir = storage_dir
        self.active_sessions: Dict[str, ConversationSession] = {}
        self.conversation_history: List[ConversationSession] = []
        
        # Create storage directory if it doesn't exist
        os.makedirs(storage_dir, exist_ok=True)
        
        # Load existing conversations
        self._load_existing_conversations()
    
    def _load_existing_conversations(self):
        """Load existing conversations from storage"""
        try:
            for filename in os.listdir(self.storage_dir):
                if filename.endswith('.json'):
                    filepath = os.path.join(self.storage_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        session = self._deserialize_session(data)
                        self.conversation_history.append(session)
        except Exception as e:
            print(f"Error loading existing conversations: {e}")
    
    def _deserialize_session(self, data: Dict) -> ConversationSession:
        """Deserialize session data from JSON"""
        messages = []
        for msg_data in data.get('messages', []):
            msg = ConversationMessage(
                id=msg_data['id'],
                role=msg_data['role'],
                content=msg_data['content'],
                timestamp=datetime.fromisoformat(msg_data['timestamp']),
                message_type=msg_data.get('message_type', 'text'),
                metadata=msg_data.get('metadata')
            )
            messages.append(msg)
        
        session = ConversationSession(
            session_id=data['session_id'],
            start_time=datetime.fromisoformat(data['start_time']),
            end_time=datetime.fromisoformat(data['end_time']) if data.get('end_time') else None,
            messages=messages,
            user_id=data.get('user_id'),
            session_type=data.get('session_type', 'voice_chat'),
            summary=data.get('summary'),
            health_insights=data.get('health_insights')
        )
        return session
    
    def start_session(self, user_id: Optional[str] = None, session_type: str = "voice_chat") -> str:
        """Start a new conversation session"""
        session_id = str(uuid.uuid4())
        session = ConversationSession(
            session_id=session_id,
            start_time=datetime.now(),
            user_id=user_id,
            session_type=session_type
        )
        
        self.active_sessions[session_id] = session
        print(f"[CONVERSATION] Started new session: {session_id}")
        return session_id
    
    def end_session(self, session_id: str):
        """End a conversation session"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session.end_time = datetime.now()
            
            # Move to history
            self.conversation_history.append(session)
            del self.active_sessions[session_id]
            
            # Save to file
            self._save_session(session)
            print(f"[CONVERSATION] Ended session: {session_id}")
    
    def add_user_message(self, session_id: str, content: str, message_type: str = "transcription", metadata: Optional[Dict] = None):
        """Add a user message to the conversation"""
        if session_id not in self.active_sessions:
            print(f"[CONVERSATION] Warning: Session {session_id} not found")
            return
        
        session = self.active_sessions[session_id]
        message = ConversationMessage(
            id=str(uuid.uuid4()),
            role="user",
            content=content,
            timestamp=datetime.now(),
            message_type=message_type,
            metadata=metadata
        )
        
        session.messages.append(message)
        print(f"[CONVERSATION] Added user message: {content[:50]}...")
    
    def add_assistant_message(self, session_id: str, content: str, message_type: str = "ai_response", metadata: Optional[Dict] = None):
        """Add an assistant message to the conversation"""
        if session_id not in self.active_sessions:
            print(f"[CONVERSATION] Warning: Session {session_id} not found")
            return
        
        session = self.active_sessions[session_id]
        message = ConversationMessage(
            id=str(uuid.uuid4()),
            role="assistant",
            content=content,
            timestamp=datetime.now(),
            message_type=message_type,
            metadata=metadata
        )
        
        session.messages.append(message)
        print(f"[CONVERSATION] Added assistant message: {content[:50]}...")
    
    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Get a conversation session by ID"""
        return self.active_sessions.get(session_id)
    
    def get_session_history(self, session_id: str) -> Optional[ConversationSession]:
        """Get a completed session from history"""
        for session in self.conversation_history:
            if session.session_id == session_id:
                return session
        return None
    
    def get_all_sessions(self) -> List[ConversationSession]:
        """Get all sessions (active and completed)"""
        return list(self.active_sessions.values()) + self.conversation_history
    
    def get_user_sessions(self, user_id: str) -> List[ConversationSession]:
        """Get all sessions for a specific user"""
        sessions = []
        for session in self.get_all_sessions():
            if session.user_id == user_id:
                sessions.append(session)
        return sessions
    
    def update_session_summary(self, session_id: str, summary: str):
        """Update the session summary"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id].summary = summary
        else:
            # Update in history
            for session in self.conversation_history:
                if session.session_id == session_id:
                    session.summary = summary
                    self._save_session(session)
                    break
    
    def update_health_insights(self, session_id: str, insights: Dict[str, Any]):
        """Update health insights for a session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id].health_insights = insights
        else:
            # Update in history
            for session in self.conversation_history:
                if session.session_id == session_id:
                    session.health_insights = insights
                    self._save_session(session)
                    break
    
    def _save_session(self, session: ConversationSession):
        """Save a session to file"""
        try:
            filename = f"{session.session_id}.json"
            filepath = os.path.join(self.storage_dir, filename)
            
            # Convert to serializable format
            data = {
                'session_id': session.session_id,
                'start_time': session.start_time.isoformat(),
                'end_time': session.end_time.isoformat() if session.end_time else None,
                'user_id': session.user_id,
                'session_type': session.session_type,
                'summary': session.summary,
                'health_insights': session.health_insights,
                'messages': []
            }
            
            for message in session.messages:
                msg_data = {
                    'id': message.id,
                    'role': message.role,
                    'content': message.content,
                    'timestamp': message.timestamp.isoformat(),
                    'message_type': message.message_type,
                    'metadata': message.metadata
                }
                data['messages'].append(msg_data)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"Error saving session {session.session_id}: {e}")
    
    def get_conversation_text(self, session_id: str) -> str:
        """Get the full conversation text for analysis"""
        session = self.get_session(session_id) or self.get_session_history(session_id)
        if not session:
            return ""
        
        conversation_text = f"Session: {session.session_id}\n"
        conversation_text += f"Type: {session.session_type}\n"
        conversation_text += f"Start: {session.start_time}\n\n"
        
        for message in session.messages:
            role = "User" if message.role == "user" else "Assistant"
            conversation_text += f"{role}: {message.content}\n"
        
        if session.summary:
            conversation_text += f"\nSummary: {session.summary}\n"
        
        return conversation_text

    def get_user_messages(self, session_id: str) -> List[str]:
        """Get all user message texts for a session (active or from history)"""
        session = self.get_session(session_id) or self.get_session_history(session_id)
        if not session:
            return []
        return [msg.content for msg in session.messages if msg.role == "user"]

# Global conversation storage instance
conversation_storage = ConversationStorage() 