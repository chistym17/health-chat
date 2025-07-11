import asyncio
from aiortc import MediaStreamTrack
from aiortc.mediastreams import AudioFrame
import numpy as np
import av
import time

class TTSOutputTrack(MediaStreamTrack):
   


    kind = "audio"

    def __init__(self, sample_rate=24000):
        super().__init__()
        self.sample_rate = sample_rate
        self.queue = asyncio.Queue()
        self._start_time = None
        self._frame_duration_ms = 20  
        self._samples_per_frame = int(self.sample_rate * self._frame_duration_ms / 1000)

    async def send_audio(self, pcm_bytes: bytes):
       
        await self.queue.put(pcm_bytes)

    async def recv(self):
       
        if self._start_time is None:
            self._start_time = time.time()

        pcm_bytes = await self.queue.get()

        samples = np.frombuffer(pcm_bytes, np.int16)

        frame = AudioFrame(format="s16", layout="mono", samples=len(samples))
        frame.pts = int((time.time() - self._start_time) * self.sample_rate)
        frame.sample_rate = self.sample_rate

        for i, plane in enumerate(frame.planes):
            plane.update(pcm_bytes)

        await asyncio.sleep(self._frame_duration_ms / 1000)
        return frame
