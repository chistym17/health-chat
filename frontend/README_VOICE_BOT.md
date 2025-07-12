# Voice Bot Frontend Implementation

This frontend implements a real-time voice chat interface using RTVI (Real-Time Voice Interface) with Pipecat integration.

## Features

- **Real-time Voice Conversation**: Connect to the backend voice bot via RTVI
- **Voice Command Recognition**: Natural language form filling
- **Contact Form Integration**: Voice-controlled form management
- **Visual Feedback**: Real-time speaker indicators and animations
- **Voice Command Helper**: Interactive guide for available commands

## Components

### Core Components

1. **`VoiceChat.tsx`** - Main voice chat interface

   - Real-time conversation display
   - Speaker status indicators
   - Connection management
   - Form integration

2. **`VoiceCommandHelper.tsx`** - Voice command reference

   - Expandable command list
   - Categorized commands
   - Visual command examples

3. **`ContactForm.tsx`** - Voice-controlled form
   - Name, email, message fields
   - Voice-triggered updates
   - Form submission

### Hooks

1. **`useRTVI.ts`** - Core RTVI management

   - Connection handling
   - Event management
   - State management
   - Audio stream handling

2. **`useContactFormTrigger.ts`** - Form automation
   - Voice command parsing
   - Field updates
   - Form submission triggers

### Types

- **`rtvi.ts`** - TypeScript definitions for RTVI interfaces

## Setup

### 1. Install Dependencies

```bash
npm install @pipecat-ai/client-js @pipecat-ai/daily-transport
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_RTVI_BASE_URL=http://localhost:8000/
```

### 3. Start the Application

```bash
npm run dev
```

## Usage

### Voice Commands

The system recognizes various voice commands:

#### Basic Commands

- "Hello" - Greet the assistant
- "How are you?" - Ask about status
- "What can you do?" - Learn about features

#### Form Commands

- "Contact form" - Open contact form
- "My name is John" - Fill name field
- "My email is john@example.com" - Fill email field
- "My message is hello" - Fill message field
- "Submit" - Submit the form

#### Conversation Commands

- "Tell me a joke" - Request entertainment
- "What's the weather?" - Ask about weather
- "Help" - Get assistance

### Navigation

- **Home Page**: Visit `/` to see the main interface
- **Voice Chat**: Visit `/voice-chat` for direct voice interaction
- **Voice Bot Connector**: Use the connector on the home page

## Technical Details

### RTVI Integration

The frontend uses the `@pipecat-ai/client-js` library to connect to the backend:

```typescript
const client = new RTVIClient({
  transport: new DailyTransport(),
  params: { baseUrl: "http://localhost:8000/" },
  enableMic: true,
  enableCam: false,
});
```

### Event Handling

The system handles various RTVI events:

- `Connected` - Connection established
- `BotReady` - Bot is ready to chat
- `UserTranscript` - User speech transcribed
- `BotTranscript` - Bot response received
- `UserStartedSpeaking` - User begins speaking
- `BotStartedSpeaking` - Bot begins speaking

### State Management

The `useRTVI` hook manages:

- Connection status
- Bot readiness
- Current speaker
- Chat messages
- Error states

## Troubleshooting

### Connection Issues

1. **Backend Not Running**: Ensure the backend is running on port 8000
2. **CORS Issues**: Check that the backend allows frontend origins
3. **Environment Variables**: Verify `VITE_RTVI_BASE_URL` is set correctly

### Audio Issues

1. **Microphone Permissions**: Allow microphone access in the browser
2. **Audio Devices**: Check that audio devices are properly connected
3. **Browser Support**: Ensure you're using a modern browser with WebRTC support

### Form Issues

1. **Voice Recognition**: Speak clearly and naturally
2. **Command Patterns**: Use the exact command patterns shown in the helper
3. **Form State**: Check that the form is open before trying to fill fields

## Development

### Adding New Commands

1. Update `VoiceCommandHelper.tsx` with new command categories
2. Add parsing logic in `useContactFormTrigger.ts`
3. Update the backend to handle new commands

### Customizing the UI

1. Modify `VoiceChat.tsx` for layout changes
2. Update `ContactForm.tsx` for form modifications
3. Customize animations and styling in the components

### Extending Functionality

1. Add new hooks for additional features
2. Create new components for specialized functionality
3. Integrate with additional backend endpoints
