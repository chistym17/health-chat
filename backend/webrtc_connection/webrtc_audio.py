import asyncio
from aiortc import MediaStreamTrack
from genai_processors.core import audio_io
from genai_processors import processor
from typing import Optional

class WebRTCAudioInputProcessor:
   

    def __init__(self, track: MediaStreamTrack):
        self.track = track
        self.buffer = bytearray()
        self.sample_rate = 16000
        self.channels = 1
        self.frame_duration_ms = 20  
        self.frame_size = int(self.sample_rate * self.frame_duration_ms / 1000) * 2  
        self._stopped = False

    async def stop(self):
        self._stopped = True
        await self.track.stop()

    async def audio_frame_generator(self):
     
        while not self._stopped:
            try:
                frame = await self.track.recv()  
                pcm_bytes = frame.to_bytes()
                self.buffer.extend(pcm_bytes)

                while len(self.buffer) >= self.frame_size:
                    chunk = self.buffer[:self.frame_size]
                    self.buffer = self.buffer[self.frame_size:]
                    yield chunk

            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[WebRTCAudioInputProcessor] Exception: {e}")
                break
