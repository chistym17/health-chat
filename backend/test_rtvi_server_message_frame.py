try:
    from pipecat.processors.frameworks.rtvi import RTVIServerMessageFrame
    print("RTVIServerMessageFrame is available.")
    frame = RTVIServerMessageFrame(
        data={
            "type": "custom-event",
            "payload": {"key": "value"}
        }
    )
    print("Frame created:", frame)
except ImportError as e:
    print("RTVIServerMessageFrame is NOT available.", e)
except Exception as ex:
    print("Error creating or using RTVIServerMessageFrame:", ex) 