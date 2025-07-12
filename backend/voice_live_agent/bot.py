import asyncio
import os
import sys
import json
import re

import aiohttp
from dotenv import load_dotenv
from loguru import logger
from helper import configure

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import Frame, EndFrame, TranscriptionFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.services.gemini_multimodal_live.gemini import GeminiMultimodalLiveLLMService
from pipecat.transports.services.daily import DailyParams, DailyTransport
from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema
from pipecat.services.llm_service import FunctionCallParams

from voice_live_agent.prompts import SYSTEM_INSTRUCTION
from voice_live_agent.form_tools import AppointmentTools
from voice_live_agent.form_declarations import function_declarations, open_appointment_decl, update_appointment_field_decl, submit_appointment_decl
from voice_live_agent.conversation_storage import conversation_storage

load_dotenv(override=True)

logger.remove(0)
logger.add(sys.stderr, level="DEBUG")

# Initialize appointment tools
appointment_tools = AppointmentTools()

# Define FunctionSchemas for Pipecat
open_appointment_schema = FunctionSchema(**open_appointment_decl)
update_appointment_field_schema = FunctionSchema(**update_appointment_field_decl)
submit_appointment_schema = FunctionSchema(**submit_appointment_decl)

# Create tools schema
tools = ToolsSchema(standard_tools=[open_appointment_schema, update_appointment_field_schema, submit_appointment_schema])


class AppointmentCommandProcessor(FrameProcessor):
    """Process appointment-related commands from user transcripts and save conversations"""
    
    def __init__(self, appointment_tools: AppointmentTools, context_aggregator, session_id: str = None):
        super().__init__()
        self.appointment_tools = appointment_tools
        self.context_aggregator = context_aggregator
        self.session_id = session_id
        
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        
        if isinstance(frame, TranscriptionFrame) and frame.user_id == "user" and frame.final:
            print(f"[BACKEND] Processing final user transcript: '{frame.text}'")
            
            # Save user transcription to conversation storage
            if self.session_id:
                conversation_storage.add_user_message(
                    self.session_id, 
                    frame.text, 
                    message_type="transcription",
                    metadata={"user_id": frame.user_id, "final": frame.final}
                )
            
            await self.process_appointment_commands(frame.text)
        
        await self.push_frame(frame, direction)
    
    async def process_appointment_commands(self, text: str):
        """Process appointment-related commands in user text"""
        text_lower = text.lower().strip()
        
        # Appointment opening commands
        if any(phrase in text_lower for phrase in ["need appointment", "schedule appointment", "book appointment", "make appointment", "see doctor", "see a doctor"]):
            appointment_type = "general"
            if any(word in text_lower for word in ["urgent", "emergency", "immediate"]):
                appointment_type = "urgent"
            elif any(word in text_lower for word in ["follow up", "follow-up", "followup"]):
                appointment_type = "follow_up"
            
            result = self.appointment_tools.open_appointment(appointment_type)
            if result["success"]:
                print(f"Appointment form opened: {result}")
                # Add appointment status to context
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["message"]
                })
                
                # Save assistant response to conversation storage
                if self.session_id:
                    conversation_storage.add_assistant_message(
                        self.session_id,
                        result["message"],
                        message_type="appointment_action",
                        metadata={"action": "open_appointment", "appointment_type": appointment_type}
                    )
        
        # Patient name updates
        elif "my name is" in text_lower:
            name_match = re.search(r"my name is (.+)", text_lower)
            if name_match:
                name = name_match.group(1).strip()
                result = self.appointment_tools.update_appointment_field("patient_name", name)
                if result["success"]:
                    print(f"Patient name updated: {result}")
                    await self.context_aggregator.user().add_message({
                        "role": "assistant", 
                        "content": result["message"]
                    })
                    
                    # Save assistant response to conversation storage
                    if self.session_id:
                        conversation_storage.add_assistant_message(
                            self.session_id,
                            result["message"],
                            message_type="appointment_action",
                            metadata={"action": "update_field", "field": "patient_name", "value": name}
                        )
        
        # Email updates
        elif "my email is" in text_lower or "email is" in text_lower:
            email_match = re.search(r"(?:my )?email is (.+)", text_lower)
            if email_match:
                email = email_match.group(1).strip()
                result = self.appointment_tools.update_appointment_field("email", email)
                if result["success"]:
                    print(f"Email updated: {result}")
                    await self.context_aggregator.user().add_message({
                        "role": "assistant",
                        "content": result["message"]
                    })
                    
                    # Save assistant response to conversation storage
                    if self.session_id:
                        conversation_storage.add_assistant_message(
                            self.session_id,
                            result["message"],
                            message_type="appointment_action",
                            metadata={"action": "update_field", "field": "email", "value": email}
                        )
        
        # Appointment reason/symptoms
        elif any(phrase in text_lower for phrase in ["i have", "i'm experiencing", "i feel", "symptoms", "pain", "problem"]):
            # Extract the reason from the text
            reason_patterns = [
                r"i have (.+)",
                r"i'm experiencing (.+)",
                r"i feel (.+)",
                r"symptoms (.+)",
                r"pain (.+)",
                r"problem (.+)"
            ]
            
            for pattern in reason_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    reason = match.group(1).strip()
                    result = self.appointment_tools.update_appointment_field("appointment_reason", reason)
                    if result["success"]:
                        print(f"Appointment reason updated: {result}")
                        await self.context_aggregator.user().add_message({
                            "role": "assistant",
                            "content": result["message"]
                        })
                        
                        # Save assistant response to conversation storage
                        if self.session_id:
                            conversation_storage.add_assistant_message(
                                self.session_id,
                                result["message"],
                                message_type="appointment_action",
                                metadata={"action": "update_field", "field": "appointment_reason", "value": reason}
                            )
                        break
        
        # Urgency level
        elif any(phrase in text_lower for phrase in ["it's urgent", "this is urgent", "emergency", "immediate", "asap"]):
            urgency = "high"
            if "emergency" in text_lower:
                urgency = "emergency"
            elif "immediate" in text_lower or "asap" in text_lower:
                urgency = "high"
            
            result = self.appointment_tools.update_appointment_field("urgency_level", urgency)
            if result["success"]:
                print(f"Urgency level updated: {result}")
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["message"]
                })
                
                # Save assistant response to conversation storage
                if self.session_id:
                    conversation_storage.add_assistant_message(
                        self.session_id,
                        result["message"],
                        message_type="appointment_action",
                        metadata={"action": "update_field", "field": "urgency_level", "value": urgency}
                    )
        
        # Appointment submission
        elif any(phrase in text_lower for phrase in ["submit appointment", "schedule appointment", "book appointment", "confirm appointment"]):
            result = self.appointment_tools.submit_appointment()
            if result["success"]:
                print(f"Appointment submitted: {result}")
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["message"]
                })
                
                # Save assistant response to conversation storage
                if self.session_id:
                    conversation_storage.add_assistant_message(
                        self.session_id,
                        result["message"],
                        message_type="appointment_action",
                        metadata={"action": "submit_appointment"}
                    )
            else:
                print(f"Appointment submission failed: {result}")
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["error"]
                })
                
                # Save assistant response to conversation storage
                if self.session_id:
                    conversation_storage.add_assistant_message(
                        self.session_id,
                        result["error"],
                        message_type="appointment_action",
                        metadata={"action": "submit_appointment", "error": True}
                    )


class ConversationProcessor(FrameProcessor):
    """Process and save AI responses to conversation storage"""
    
    def __init__(self, session_id: str = None):
        super().__init__()
        self.session_id = session_id
        self.current_ai_response = ""
        
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        
        # Handle AI response frames (you might need to adjust this based on the actual frame types)
        if hasattr(frame, 'text') and frame.text:
            self.current_ai_response += frame.text
            
            # Save AI response to conversation storage
            if self.session_id and self.current_ai_response.strip():
                conversation_storage.add_assistant_message(
                    self.session_id,
                    self.current_ai_response.strip(),
                    message_type="ai_response",
                    metadata={"frame_type": type(frame).__name__}
                )
                self.current_ai_response = ""
        
        await self.push_frame(frame, direction)


async def main():
    async with aiohttp.ClientSession() as session:
        (room_url, token) = await configure(session)

        transport = DailyTransport(
            room_url,
            token,
            "Healia Healthcare Assistant",
            DailyParams(
                audio_in_sample_rate=16000,
                audio_out_sample_rate=24000,
                audio_out_enabled=True,
                camera_out_enabled=True,
                camera_out_width=1024,
                camera_out_height=576,
                vad_enabled=True,
                vad_audio_passthrough=True,
                vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
            ),
        )

        llm = GeminiMultimodalLiveLLMService(
            api_key=os.getenv("GOOGLE_API_KEY"),
            voice_id="Fenrir", 
            transcribe_user_audio=True,
            transcribe_model_audio=True,
            system_instruction=SYSTEM_INSTRUCTION,
            tools=tools,
        )

        # Register function handlers
        async def open_appointment_handler(params: FunctionCallParams):
            appointment_type = params.arguments.get("appointment_type", "general")
            print(f"[TOOL CALL] open_appointment: {appointment_type}")
            result = appointment_tools.open_appointment(appointment_type)
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        async def update_appointment_field_handler(params: FunctionCallParams):
            field_name = params.arguments.get("field_name", "")
            value = params.arguments.get("value", "")
            print(f"[TOOL CALL] update_appointment_field: {field_name}={value}")
            # Print extracted data
            print(f"[EXTRACTED DATA] field_name: {field_name}, value: {value}")
            result = appointment_tools.update_appointment_field(field_name, value)
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        async def submit_appointment_handler(params: FunctionCallParams):
            print(f"[TOOL CALL] submit_appointment")
            result = appointment_tools.submit_appointment()
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        llm.register_function("open_appointment", open_appointment_handler)
        llm.register_function("update_appointment_field", update_appointment_field_handler)
        llm.register_function("submit_appointment", submit_appointment_handler)

        messages = [
            {
                "role": "user",
                "content": 'Start by saying "Hello, I\'m Healia, your healthcare assistant. I can help you schedule appointments and provide health guidance. If you need to schedule an appointment, just say \'I need an appointment\' and I\'ll help you through the process."',
            },
        ]

        context = OpenAILLMContext(messages)
        context_aggregator = llm.create_context_aggregator(context)

        # Create the RTVI processor
        rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

        # Start a new conversation session
        session_id = conversation_storage.start_session(session_type="healthcare_appointment")
        print(f"[CONVERSATION] Started session: {session_id}")

        # Create appointment command processor with session ID
        appointment_processor = AppointmentCommandProcessor(appointment_tools, context_aggregator, session_id)
        
        # Create conversation processor
        conversation_processor = ConversationProcessor(session_id)

        pipeline = Pipeline(
            [
                transport.input(),
                rtvi,
                context_aggregator.user(),
                llm,
                appointment_processor,  # Add appointment processor before filter
                conversation_processor,  # Add conversation processor
                transport.output(),
                context_aggregator.assistant(),
            ]
        )

        task = PipelineTask(
            pipeline,
            params=PipelineParams(
                allow_interruptions=True,
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
            observers=[RTVIObserver(rtvi)],
        )

        @transport.event_handler("on_first_participant_joined")
        async def on_first_participant_joined(transport, participant):
            await transport.capture_participant_transcription(participant["id"])
            await task.queue_frames([context_aggregator.user().get_context_frame()])

        @transport.event_handler("on_participant_left")
        async def on_participant_left(transport, participant, reason):
            print(f"Participant left: {participant}")
            
            # End the conversation session
            conversation_storage.end_session(session_id)
            print(f"[CONVERSATION] Session ended: {session_id}")
            
            await task.queue_frame(EndFrame())

        runner = PipelineRunner()

        await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
