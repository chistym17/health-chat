#!/usr/bin/env python3
"""
Main entry point for voice_live_agent package
"""

import asyncio
from voice_live_agent.bot import main

if __name__ == "__main__":
    asyncio.run(main()) 