#!/usr/bin/env python3
"""
Startup script for SlopeSelector AI backend server
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Check if GEMINI_API_KEY is set
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY environment variable is not set!")
        print("   Please set your Gemini API key in a .env file or environment variable.")
        print("   Example: GEMINI_API_KEY=your_api_key_here")
        print()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
