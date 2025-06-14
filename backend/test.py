import asyncio
import websockets
import json

async def test_chat():
    uri = "ws://localhost:8000/ws/chat"
    async with websockets.connect(uri) as websocket:
        # 1. Send test message (update this input to simulate different cases)
        user_message = {
            "text": "I have chest pain and shortness of breath"
        }
        await websocket.send(json.dumps(user_message))

        # 2. Wait for response(s)
        while True:
            try:
                response = await websocket.recv()
                data = json.loads(response)
                print(f"🧠 Response Type: {data.get('type')}")
                print(f"📩 Message: {data.get('message')}")

                # If follow-up questions are needed
                if data.get("type") == "followup":
                    for idx, q in enumerate(data.get("questions", []), 1):
                        print(f"❓ Q{idx}: {q}")
                    # Optionally respond with answers here...

                # Stop after one diagnosis or info response
                if data.get("type") in ["diagnosis", "info"]:
                    break

            except websockets.exceptions.ConnectionClosed:
                print("WebSocket closed by server.")
                break

# Run the test
if __name__ == "__main__":
    asyncio.run(test_chat())
