#!/usr/bin/env python3
"""
Setup script for SlopeSelector AI backend
"""
import os
import sys

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = ".env"
    if not os.path.exists(env_file):
        with open(env_file, 'w') as f:
            f.write("GEMINI_API_KEY=your_gemini_api_key_here\n")
        print(f"Created {env_file} file")
        print("Please edit the file and add your actual Gemini API key")
    else:
        print(f"{env_file} already exists")

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import httpx
        import pydantic
        print("All required packages are installed")
        return True
    except ImportError as e:
        print(f"Missing package: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def main():
    """Run setup"""
    print("Setting up SlopeSelector AI backend...")
    
    # Create .env file
    create_env_file()
    
    # Check requirements
    if check_requirements():
        print("Setup complete!")
        print("\nNext steps:")
        print("1. Edit .env file and add your GEMINI_API_KEY")
        print("2. Run: python run_server.py")
    else:
        print("Setup incomplete. Please install requirements first.")

if __name__ == "__main__":
    main()
