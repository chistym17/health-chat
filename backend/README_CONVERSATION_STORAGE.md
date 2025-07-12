# Conversation Storage Implementation

This document describes the conversation storage system implemented in the Healia voice bot backend.

## Overview

The conversation storage system automatically captures and stores all voice interactions between users and the AI assistant. This data can be used for:

- **Health Diagnosis**: Analyzing conversation patterns and symptoms
- **User History**: Tracking patient interactions over time
- **Quality Assurance**: Reviewing AI responses and interactions
- **Research**: Analyzing voice interaction patterns

## Architecture

### Core Components

1. **ConversationStorage** (`voice_live_agent/conversation_storage.py`)

   - Manages conversation sessions in memory and file system
   - Handles session lifecycle (start, end, save)
   - Provides data retrieval and analysis methods

2. **FormCommandProcessor** (Updated `voice_live_agent/bot.py`)

   - Captures user transcriptions from `TranscriptionFrame` objects
   - Saves user messages and AI responses
   - Integrates with existing form processing logic

3. **ConversationProcessor** (New in `voice_live_agent/bot.py`)

   - Captures AI responses from the pipeline
   - Saves assistant messages to storage

4. **ConversationRouter** (`conversation_router.py`)
   - Provides REST API endpoints for accessing conversation data
   - Supports conversation analysis and health insights

## Data Structure

### ConversationSession

```python
@dataclass
class ConversationSession:
    session_id: str                    # Unique session identifier
    start_time: datetime              # Session start timestamp
    end_time: Optional[datetime]      # Session end timestamp
    messages: List[ConversationMessage] # All messages in the session
    user_id: Optional[str]            # User identifier
    session_type: str                 # 'voice_chat', 'diagnosis', 'consultation'
    summary: Optional[str]            # Session summary
    health_insights: Optional[Dict]   # Health-related insights
```

### ConversationMessage

```python
@dataclass
class ConversationMessage:
    id: str                           # Unique message identifier
    role: str                         # 'user' or 'assistant'
    content: str                      # Message text content
    timestamp: datetime               # Message timestamp
    message_type: str                 # 'text', 'transcription', 'ai_response'
    metadata: Optional[Dict]          # Additional message data
```

## Storage

### File System Storage

- Conversations are saved as JSON files in the `conversations/` directory
- Each session is saved as `{session_id}.json`
- Files are automatically created when sessions end
- Existing conversations are loaded on startup

### Memory Storage

- Active sessions are kept in memory for fast access
- Completed sessions are moved to file storage
- Session history is loaded from files on startup

## API Endpoints

### Conversation Management

- `GET /conversations` - List all conversations
- `GET /conversations/{session_id}` - Get specific conversation
- `GET /conversations/{session_id}/text` - Get conversation as text
- `GET /conversations/active` - Get active sessions
- `GET /conversations/user/{user_id}` - Get user's conversations

### Analysis and Insights

- `POST /conversations/{session_id}/summary` - Update session summary
- `POST /conversations/{session_id}/health-insights` - Update health insights
- `GET /conversations/stats` - Get conversation statistics

## Integration with Voice Bot

### Automatic Capture

The system automatically captures:

1. **User Transcriptions**: All user speech is transcribed and saved
2. **AI Responses**: All AI assistant responses are captured
3. **Form Actions**: Form-related actions and responses
4. **Session Metadata**: Timing, user info, session type

### Pipeline Integration

```python
pipeline = Pipeline([
    transport.input(),
    rtvi,
    context_aggregator.user(),
    llm,
    form_processor,        # Captures user transcriptions
    conversation_processor, # Captures AI responses
    transport.output(),
    context_aggregator.assistant(),
])
```

## Usage Examples

### Starting a Session

```python
session_id = conversation_storage.start_session(
    user_id="patient_123",
    session_type="voice_chat"
)
```

### Adding Messages

```python
# User message
conversation_storage.add_user_message(
    session_id,
    "I have a headache",
    message_type="transcription"
)

# AI response
conversation_storage.add_assistant_message(
    session_id,
    "I understand you have a headache. How long has it been present?",
    message_type="ai_response"
)
```

### Getting Conversation Data

```python
# Get full conversation text
text = conversation_storage.get_conversation_text(session_id)

# Get session with all messages
session = conversation_storage.get_session(session_id)

# Update health insights
conversation_storage.update_health_insights(session_id, {
    "symptoms": ["headache"],
    "severity": "mild",
    "recommendations": ["rest", "hydration"]
})
```

## Health Diagnosis Integration

### Conversation Analysis

The stored conversations can be analyzed for:

1. **Symptom Extraction**: Identifying reported symptoms
2. **Severity Assessment**: Analyzing symptom descriptions
3. **Pattern Recognition**: Identifying recurring issues
4. **Treatment Tracking**: Monitoring response to recommendations

### Example Analysis

```python
# Get conversation for analysis
conversation_text = conversation_storage.get_conversation_text(session_id)

# Analyze with AI for health insights
health_insights = analyze_conversation_for_health(conversation_text)

# Save insights back to session
conversation_storage.update_health_insights(session_id, health_insights)
```

## Testing

Run the test script to verify functionality:

```bash
python test_conversation_storage.py
```

This will test:

- Session creation and management
- Message storage and retrieval
- File system persistence
- API endpoint functionality

## Security and Privacy

### Data Protection

- Conversations are stored locally by default
- No automatic cloud synchronization
- User consent should be obtained for data storage
- Consider implementing data retention policies

### Privacy Considerations

- Personal health information is stored
- Implement appropriate access controls
- Consider data anonymization for research
- Follow healthcare data regulations (HIPAA, etc.)

## Future Enhancements

### Planned Features

1. **Encryption**: Encrypt stored conversation files
2. **Compression**: Compress conversation data for storage efficiency
3. **Search**: Full-text search across conversations
4. **Analytics**: Advanced conversation analytics and insights
5. **Export**: Export conversations in various formats
6. **Backup**: Automated backup and recovery

### Integration Opportunities

1. **Electronic Health Records**: Integration with EHR systems
2. **Telemedicine Platforms**: Connect with existing telemedicine solutions
3. **Research Tools**: Export data for medical research
4. **Quality Metrics**: Track conversation quality and outcomes

## Troubleshooting

### Common Issues

1. **Storage Directory**: Ensure `conversations/` directory exists
2. **Permissions**: Check file write permissions
3. **Memory Usage**: Monitor memory usage with large conversation volumes
4. **File Corruption**: Implement file validation and recovery

### Debugging

- Check logs for conversation storage messages
- Verify file creation in `conversations/` directory
- Test API endpoints with curl or Postman
- Use the test script to verify functionality
