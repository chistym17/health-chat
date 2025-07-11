import asyncio
import collections
import logging
from typing import Optional, AsyncGenerator
import numpy as np

logger = logging.getLogger(__name__)

class CircularAudioBuffer:
    """
    Thread-safe circular buffer for audio data management
    """
    def __init__(self, max_size: int = 1024 * 1024):  
        self.max_size = max_size
        self.buffer = collections.deque(maxlen=max_size // 1024)  
        self._lock = asyncio.Lock()
        self._stopped = False
        self.total_bytes = 0
        
    async def add_data(self, data: bytes) -> bool:
        """Add audio data to buffer, returns True if successful"""
        if self._stopped:
            return False
            
        async with self._lock:
            if len(data) + self.total_bytes > self.max_size:
                logger.warning("Audio buffer overflow, dropping oldest data")
                while self.buffer and len(data) + self.total_bytes > self.max_size:
                    old_data = self.buffer.popleft()
                    self.total_bytes -= len(old_data)
            
            self.buffer.append(data)
            self.total_bytes += len(data)
            return True
    
    async def get_data(self, size: int) -> Optional[bytes]:
        """Get audio data of specified size, returns None if not enough data"""
        if self._stopped:
            return None
            
        async with self._lock:
            if self.total_bytes < size:
                return None
                
            result = bytearray()
            bytes_needed = size
            
            while bytes_needed > 0 and self.buffer:
                chunk = self.buffer.popleft()
                if len(chunk) <= bytes_needed:
                    result.extend(chunk)
                    bytes_needed -= len(chunk)
                    self.total_bytes -= len(chunk)
                else:
                    result.extend(chunk[:bytes_needed])
                    remaining = chunk[bytes_needed:]
                    self.buffer.appendleft(remaining)
                    self.total_bytes -= bytes_needed
                    bytes_needed = 0
            
            return bytes(result) if result else None
    
    async def clear(self):
        """Clear all data from buffer"""
        async with self._lock:
            self.buffer.clear()
            self.total_bytes = 0
    
    async def stop(self):
        """Stop the buffer and clear data"""
        self._stopped = True
        await self.clear()
    
    @property
    def is_empty(self) -> bool:
        return self.total_bytes == 0
    
    @property
    def size(self) -> int:
        return self.total_bytes

class AudioFrameProcessor:
    """
    Processes audio frames with proper buffering and format handling
    """
    def __init__(self, sample_rate: int = 16000, channels: int = 1, frame_duration_ms: int = 20):
        self.sample_rate = sample_rate
        self.channels = channels
        self.frame_duration_ms = frame_duration_ms
        self.frame_size = int(self.sample_rate * self.frame_duration_ms / 1000) * 2  # 16-bit samples
        self.buffer = CircularAudioBuffer()
        self._stopped = False
        
    async def add_frame(self, frame_data: bytes) -> bool:
        """Add audio frame data to processor"""
        return await self.buffer.add_data(frame_data)
    
    async def get_frame(self) -> Optional[bytes]:
        """Get a complete audio frame"""
        return await self.buffer.get_data(self.frame_size)
    
    async def frame_generator(self) -> AsyncGenerator[bytes, None]:
        """Generate audio frames asynchronously"""
        while not self._stopped:
            frame = await self.get_frame()
            if frame:
                yield frame
            else:
                await asyncio.sleep(0.001)  
    
    async def stop(self):
        """Stop the processor and cleanup"""
        self._stopped = True
        await self.buffer.stop()
    
    @property
    def buffer_usage(self) -> float:
        """Get buffer usage percentage"""
        return (self.buffer.size / self.buffer.max_size) * 100 