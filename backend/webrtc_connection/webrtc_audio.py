import asyncio
from aiortc import MediaStreamTrack
from typing import Optional, AsyncGenerator
import logging

from .audio_buffer import AudioFrameProcessor
from .error_handler import ErrorHandler, with_error_handling, AudioProcessingError

logger = logging.getLogger(__name__)

class WebRTCAudioInputProcessor:
    """
    Improved WebRTC audio input processor with proper buffer management and error handling
    """
    def __init__(self, track: MediaStreamTrack, sample_rate: int = 16000, channels: int = 1):
        self.track = track
        self.sample_rate = sample_rate
        self.channels = channels
        self.frame_processor = AudioFrameProcessor(sample_rate, channels)
        self.error_handler = ErrorHandler()
        self._stopped = False
        self._processing_task: Optional[asyncio.Task] = None

    async def start(self):
        """Start processing audio frames"""
        if self._processing_task is None:
            self._processing_task = asyncio.create_task(self._process_audio_frames())
            logger.info("WebRTC audio processor started")

    async def stop(self):
        """Stop processing and cleanup resources"""
        self._stopped = True
        
        if self._processing_task:
            self._processing_task.cancel()
            try:
                await self._processing_task
            except asyncio.CancelledError:
                pass
        
        await self.frame_processor.stop()
        logger.info("WebRTC audio processor stopped")

    @with_error_handling(ErrorHandler(), "audio")
    async def _process_audio_frames(self):
        """Process incoming audio frames"""
        while not self._stopped:
            try:
                frame = await self.track.recv()
                pcm_bytes = frame.to_bytes()
                
                success = await self.frame_processor.add_frame(pcm_bytes)
                if not success:
                    logger.warning("Failed to add audio frame to buffer")
                
                if self.frame_processor.buffer_usage > 80:
                    logger.warning(f"High buffer usage: {self.frame_processor.buffer_usage:.1f}%")
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error processing audio frame: {e}")
                raise AudioProcessingError(f"Frame processing failed: {e}")

    async def audio_frame_generator(self) -> AsyncGenerator[bytes, None]:
        """
        Generate audio frames asynchronously with proper error handling
        """
        await self.start()
        
        try:
            async for frame in self.frame_processor.frame_generator():
                if self._stopped:
                    break
                yield frame
        except Exception as e:
            logger.error(f"Error in audio frame generator: {e}")
            raise AudioProcessingError(f"Frame generation failed: {e}")
        finally:
            await self.stop()

    @property
    def buffer_usage(self) -> float:
        """Get current buffer usage percentage"""
        return self.frame_processor.buffer_usage

    @property
    def is_processing(self) -> bool:
        """Check if audio processing is active"""
        return not self._stopped and self._processing_task is not None
