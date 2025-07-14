try:
    from pipecat.frames.frames import ServerMessageFrame
    print("ServerMessageFrame is available.")
except ImportError:
    print("ServerMessageFrame is NOT available.") 