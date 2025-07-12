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
from voice_live_agent.form_tools import FormTools
from voice_live_agent.form_declarations import function_declarations, open_form_decl, update_form_field_decl, submit_form_decl

load_dotenv(override=True)

logger.remove(0)
logger.add(sys.stderr, level="DEBUG")

# Initialize form tools
form_tools = FormTools()

# Define FunctionSchemas for Pipecat
open_form_schema = FunctionSchema(**open_form_decl)
update_form_field_schema = FunctionSchema(**update_form_field_decl)
submit_form_schema = FunctionSchema(**submit_form_decl)

# Create tools schema
tools = ToolsSchema(standard_tools=[open_form_schema, update_form_field_schema, submit_form_schema])


class FormCommandProcessor(FrameProcessor):
    """Process form-related commands from user transcripts"""
    
    def __init__(self, form_tools: FormTools, context_aggregator):
        super().__init__()
        self.form_tools = form_tools
        self.context_aggregator = context_aggregator
        
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        
        if isinstance(frame, TranscriptionFrame) and frame.user_id == "user" and frame.final:
            print(f"[BACKEND] Processing final user transcript: '{frame.text}'")
            await self.process_form_commands(frame.text)
        
        await self.push_frame(frame, direction)
    
    async def process_form_commands(self, text: str):
        """Process form-related commands in user text"""
        text_lower = text.lower().strip()
        
        # Form opening commands
        if any(phrase in text_lower for phrase in ["fill a form", "open a form", "start a form", "registration form", "contact form", "feedback form"]):
            form_type = "registration"
            if "contact" in text_lower:
                form_type = "contact"
            elif "feedback" in text_lower:
                form_type = "feedback"
            
            result = self.form_tools.open_form(form_type)
            if result["success"]:
                print(f"Form opened: {result}")
                # Add form status to context
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["message"]
                })
        
        # Field updates (simple pattern matching)
        elif "my name is" in text_lower:
            name_match = re.search(r"my name is (.+)", text_lower)
            if name_match:
                name = name_match.group(1).strip()
                result = self.form_tools.update_form_field("name", name)
                if result["success"]:
                    print(f"Name updated: {result}")
                    await self.context_aggregator.user().add_message({
                        "role": "assistant", 
                        "content": result["message"]
                    })
        
        elif "my email is" in text_lower or "email is" in text_lower:
            email_match = re.search(r"(?:my )?email is (.+)", text_lower)
            if email_match:
                email = email_match.group(1).strip()
                result = self.form_tools.update_form_field("email", email)
                if result["success"]:
                    print(f"Email updated: {result}")
                    await self.context_aggregator.user().add_message({
                        "role": "assistant",
                        "content": result["message"]
                    })
        
        elif "my phone" in text_lower or "phone number" in text_lower:
            phone_match = re.search(r"(?:my )?phone(?: number)? is (.+)", text_lower)
            if phone_match:
                phone = phone_match.group(1).strip()
                result = self.form_tools.update_form_field("phone", phone)
                if result["success"]:
                    print(f"Phone updated: {result}")
                    await self.context_aggregator.user().add_message({
                        "role": "assistant",
                        "content": result["message"]
                    })
        
        # Form submission
        elif any(phrase in text_lower for phrase in ["submit form", "send form", "submit the form", "send the form"]):
            result = self.form_tools.submit_form()
            if result["success"]:
                print(f"Form submitted: {result}")
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["message"]
                })
            else:
                print(f"Form submission failed: {result}")
                await self.context_aggregator.user().add_message({
                    "role": "assistant",
                    "content": result["error"]
                })


async def main():
    async with aiohttp.ClientSession() as session:
        (room_url, token) = await configure(session)

        transport = DailyTransport(
            room_url,
            token,
            "Chatbot",
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
        async def open_form_handler(params: FunctionCallParams):
            form_type = params.arguments.get("form_type", "registration")
            print(f"[TOOL CALL] open_form: {form_type}")
            result = form_tools.open_form(form_type)
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        async def update_form_field_handler(params: FunctionCallParams):
            field_name = params.arguments.get("field_name", "")
            value = params.arguments.get("value", "")
            print(f"[TOOL CALL] update_form_field: {field_name}={value}")
            # Print extracted data
            print(f"[EXTRACTED DATA] field_name: {field_name}, value: {value}")
            result = form_tools.update_form_field(field_name, value)
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        async def submit_form_handler(params: FunctionCallParams):
            print(f"[TOOL CALL] submit_form")
            result = form_tools.submit_form()
            print(f"[TOOL RESULT] {result}")
            await params.result_callback(result)

        llm.register_function("open_form", open_form_handler)
        llm.register_function("update_form_field", update_form_field_handler)
        llm.register_function("submit_form", submit_form_handler)

        messages = [
            {
                "role": "user",
                "content": 'Start by saying "Hello, I\'m Gemini. I can help you with conversations and filling out forms. Just say \'I want to fill a form\' to get started."',
            },
        ]

        context = OpenAILLMContext(messages)
        context_aggregator = llm.create_context_aggregator(context)

        # Create the RTVI processor
        rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

     

        # Create form command processor
        form_processor = FormCommandProcessor(form_tools, context_aggregator)

        pipeline = Pipeline(
            [
                transport.input(),
                rtvi,
                context_aggregator.user(),
                llm,
                form_processor,  # Add form processor before filter
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
            await task.queue_frame(EndFrame())

        runner = PipelineRunner()

        await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
