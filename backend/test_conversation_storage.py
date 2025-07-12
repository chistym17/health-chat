#!/usr/bin/env python3
"""
Test script for conversation storage functionality
"""

import asyncio
import sys
import os

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_live_agent.conversation_storage import conversation_storage

def test_conversation_storage():
    """Test the conversation storage functionality"""
    print("Testing Conversation Storage...")
    
    # Test 1: Start a new session
    print("\n1. Starting a new session...")
    session_id = conversation_storage.start_session(user_id="test_user", session_type="voice_chat")
    print(f"   Session ID: {session_id}")
    
    # Test 2: Add user messages
    print("\n2. Adding user messages...")
    test_messages = [
        "Hello, I'm feeling a bit unwell today",
        "I have a headache and some nausea",
        "My name is John Smith",
        "My email is john@example.com"
    ]
    
    for i, message in enumerate(test_messages):
        conversation_storage.add_user_message(
            session_id, 
            message, 
            message_type="transcription",
            metadata={"message_number": i + 1}
        )
        print(f"   Added user message {i+1}: {message[:30]}...")
    
    # Test 3: Add assistant messages
    print("\n3. Adding assistant messages...")
    assistant_messages = [
        "Hello! I'm here to help you. Can you tell me more about your symptoms?",
        "I understand you're experiencing a headache and nausea. How long have these symptoms been present?",
        "Thank you for providing your name, John Smith.",
        "I've recorded your email address as john@example.com."
    ]
    
    for i, message in enumerate(assistant_messages):
        conversation_storage.add_assistant_message(
            session_id,
            message,
            message_type="ai_response",
            metadata={"response_number": i + 1}
        )
        print(f"   Added assistant message {i+1}: {message[:30]}...")
    
    # Test 4: Get session information
    print("\n4. Retrieving session information...")
    session = conversation_storage.get_session(session_id)
    if session:
        print(f"   Session found: {session.session_id}")
        print(f"   Messages: {len(session.messages)}")
        print(f"   Start time: {session.start_time}")
        print(f"   Session type: {session.session_type}")
    
    # Test 5: Get conversation text
    print("\n5. Getting conversation text...")
    conversation_text = conversation_storage.get_conversation_text(session_id)
    print(f"   Conversation length: {len(conversation_text)} characters")
    print(f"   First 200 chars: {conversation_text[:200]}...")
    
    # Test 6: Update session summary
    print("\n6. Updating session summary...")
    summary = "Patient John Smith reported headache and nausea. Contact information collected."
    conversation_storage.update_session_summary(session_id, summary)
    print(f"   Summary updated: {summary}")
    
    # Test 7: Update health insights
    print("\n7. Updating health insights...")
    insights = {
        "symptoms": ["headache", "nausea"],
        "severity": "mild",
        "recommendations": ["rest", "hydration", "monitor symptoms"],
        "follow_up": "Contact doctor if symptoms worsen"
    }
    conversation_storage.update_health_insights(session_id, insights)
    print(f"   Health insights updated: {insights}")
    
    # Test 8: End session
    print("\n8. Ending session...")
    conversation_storage.end_session(session_id)
    print(f"   Session ended: {session_id}")
    
    # Test 9: Verify session is in history
    print("\n9. Verifying session in history...")
    history_session = conversation_storage.get_session_history(session_id)
    if history_session:
        print(f"   Session found in history: {history_session.session_id}")
        print(f"   End time: {history_session.end_time}")
        print(f"   Summary: {history_session.summary}")
        print(f"   Health insights: {history_session.health_insights}")
    
    # Test 10: Get all sessions
    print("\n10. Getting all sessions...")
    all_sessions = conversation_storage.get_all_sessions()
    print(f"   Total sessions: {len(all_sessions)}")
    print(f"   Active sessions: {len(conversation_storage.active_sessions)}")
    print(f"   Completed sessions: {len(conversation_storage.conversation_history)}")
    
    print("\n✅ All tests completed successfully!")
    return True

if __name__ == "__main__":
    try:
        test_conversation_storage()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 