# test_ws_workflow.py

import asyncio
import websockets
import json

async def test_workflow():
    uri = "ws://localhost:8000/ws/chat"  

    async with websockets.connect(uri) as websocket:
        message = {"text": "I am chisty.i like to play with my friends"}
        await websocket.send(json.dumps(message))
        print(f"> Sent: {message['text']}")

        response = await websocket.recv()
        parsed = json.loads(response)
        print(f"< Received:\n{json.dumps(parsed, indent=2)}")

asyncio.run(test_workflow())
