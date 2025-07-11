import asyncio
from aiortc import MediaStreamTrack
from aiortc.mediastreams import AudioFrame
import numpy as np
import time
import logging
from typing import Optional

from .error_handler import ErrorHandler, with_error_handling, AudioProcessingError

logger = logging.getLogger(__name__)

class TTSOutputTrack(MediaStreamTrack):
    """
    Improved TTS output track with proper error handling and non-blocking operations
    """
    kind = "audio"

    def __init__(self, sample_rate: int = 24000, max_queue_size: int = 100):
        super().__init__()
        self.sample_rate = sample_rate
        self.max_queue_size = max_queue_size
        self.queue = asyncio.Queue(maxsize=max_queue_size)
        self._start_time = None
        self._frame_duration_ms = 20
        self._samples_per_frame = int(self.sample_rate * self._frame_duration_ms / 1000)
        self._stopped = False
        self.error_handler = ErrorHandler()
        self._last_frame_time = 0

    async def send_audio(self, pcm_bytes: bytes):
        """
        Send audio data to the output queue with overflow protection
        """
        if self._stopped:
            return False
            
        try:
            if self.queue.qsize() >= self.max_queue_size:
                logger.warning("TTS output queue full, dropping oldest audio")
                try:
                    self.queue.get_nowait()  # Remove oldest item
                except asyncio.QueueEmpty:
                    pass
            
            self.queue.put_nowait(pcm_bytes)
            return True
        except asyncio.QueueFull:
            logger.error("TTS output queue overflow")
            return False
        except Exception as e:
            logger.error(f"Error sending audio: {e}")
            return False

    @with_error_handling(ErrorHandler(), "audio")
    async def recv(self):
        """
        Receive audio frame with proper timing and error handling
        """
        if self._stopped:
            raise AudioProcessingError("TTS output track stopped")
            
        if self._start_time is None:
            self._start_time = time.time()

        try:
            # Get audio data with timeout
            pcm_bytes = await asyncio.wait_for(self.queue.get(), timeout=1.0)
            
            # Create audio frame
            samples = np.frombuffer(pcm_bytes, np.int16)
            frame = AudioFrame(format="s16", layout="mono", samples=len(samples))
            frame.pts = int((time.time() - self._start_time) * self.sample_rate)
            frame.sample_rate = self.sample_rate

            # Update frame data
            for i, plane in enumerate(frame.planes):
                plane.update(pcm_bytes)

            # Maintain proper timing without blocking
            current_time = time.time()
            time_since_last_frame = current_time - self._last_frame_time
            target_interval = self._frame_duration_ms / 1000
            
            if time_since_last_frame < target_interval:
                sleep_time = target_interval - time_since_last_frame
                await asyncio.sleep(sleep_time)
            
            self._last_frame_time = time.time()
            return frame
            
        except asyncio.TimeoutError:
            # Return silence if no audio data available
            silence_samples = np.zeros(self._samples_per_frame, dtype=np.int16)
            frame = AudioFrame(format="s16", layout="mono", samples=len(silence_samples))
            frame.pts = int((time.time() - self._start_time) * self.sample_rate)
            frame.sample_rate = self.sample_rate
            
            for i, plane in enumerate(frame.planes):
                plane.update(silence_samples.tobytes())
            
            return frame
        except Exception as e:
            logger.error(f"Error in TTS output recv: {e}")
            raise AudioProcessingError(f"TTS output failed: {e}")

    async def stop(self):
        """Stop the TTS output track and cleanup"""
        self._stopped = True
        
        # Clear the queue
        while not self.queue.empty():
            try:
                self.queue.get_nowait()
            except asyncio.QueueEmpty:
                break
        
        logger.info("TTS output track stopped")

    @property
    def queue_size(self) -> int:
        """Get current queue size"""
        return self.queue.qsize()

    @property
    def is_active(self) -> bool:
        """Check if the track is active"""
        return not self._stopped
