import os
import httpx
import json
import time
from typing import Dict, Any

# Your API key should be loaded from environment variables
API_KEY = os.environ.get("GEMINI_API_KEY", "")
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={API_KEY}"

# The JSON schema to enforce
GENERATION_CONFIG = {
    "responseMimeType": "application/json",
    "responseSchema": {
        "type": "OBJECT",
        "properties": {
            "categories": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "categoryTitle": {"type": "STRING"},
                        "products": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "name": {"type": "STRING"},
                                    "brand": {"type": "STRING"},
                                    "description": {"type": "STRING"},
                                    "priceRange": {"type": "STRING"},
                                    "pros": {"type": "ARRAY", "items": {"type": "STRING"}},
                                    "cons": {"type": "ARRAY", "items": {"type": "STRING"}},
                                    "highlight": {"type": "STRING"},
                                    "storeLink": {"type": "ARRAY", "items": {"type": "STRING"}},
                                },
                                "required": ["name", "brand", "description", "priceRange", "pros", "cons", "highlight"]
                            }
                        }
                    },
                    "required": ["categoryTitle", "products"]
                }
            }
        },
        "required": ["categories"]
    }
}

def get_system_prompt() -> str:
    """Returns the full system prompt for the AI"""
    return """You are "SlopeSelector AI," an expert ski and snowboard gear advisor with deep knowledge of the latest products, brands, and technologies.

Your task is to analyze the user's prompt and provide personalized gear recommendations with detailed comparisons.

Your Instructions:

Analyze the User: Carefully consider the user's skill level (beginner, intermediate, advanced, expert), intended use (park, all-mountain, powder, racing), planned trips, and any specific preferences mentioned.

Select Categories: Based on the prompt, decide which gear categories are relevant. Common categories include: "Skis", "Snowboards", "Ski Boots", "Snowboard Boots", "Bindings", "Goggles", "Helmets", "Jackets", "Pants".

Find Products: For each category, recommend 2-3 products with clear, searchable names. Base your recommendations on well-known, established products from reputable brands.

Add Details: For each product, provide:

name: The full, clear product name that users can easily search for (e.g., "Rossignol Experience 88 Skis", "Salomon S/Pro 100 Boots").
brand: The brand name.
description: A brief 1-sentence description with key specs (e.g., "88mm waist, 170cm length, intermediate flex" or "100 flex, 26.5 mondo, heat-moldable").
priceRange: A price range in USD format (e.g., "$400-500", "$200-300", "$800-1000"). Use realistic current market prices for these products.
pros: An array of 2-3 short bullet points highlighting the main strengths.
cons: An array of 1-2 short bullet points mentioning key limitations.
highlight: A descriptive tag like "Best Value", "Top Performance", "Beginner Friendly", "Pro Choice", "Most Versatile".
storeLink: An empty array [] - we will not include store links.

IMPORTANT NOTES:
- Use only real, well-known products from established brands
- Make product names clear and searchable (include model numbers when available)
- Keep descriptions brief with key specs only (width, length, flex, etc.)
- Keep pros/cons short and focused on main points
- Provide realistic current market price ranges in USD format
- Focus on products that are commonly available and well-reviewed
- Make it easy for users to find these products by searching online

Format Output: You MUST return ONLY a valid JSON object adhering to the specified schema. Do not include any text, backticks, or explanations outside of the JSON."""

async def fetch_recommendations(user_prompt: str) -> Dict[str, Any]:
    """
    Fetches recommendations from the Gemini API with exponential backoff.
    """
    if not API_KEY:
        raise Exception("GEMINI_API_KEY environment variable is not set")
    
    payload = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "systemInstruction": {"parts": [{"text": get_system_prompt()}]},
        "generationConfig": GENERATION_CONFIG
    }
    
    max_retries = 5
    delay = 1.0  # seconds
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(max_retries):
            try:
                response = await client.post(API_URL, json=payload)
                response.raise_for_status()  # Raise an exception for bad status codes
                
                result = response.json()
                json_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
                
                return json.loads(json_text)

            except (httpx.RequestError, httpx.HTTPStatusError, json.JSONDecodeError) as e:
                print(f"API call attempt {attempt + 1} failed: {e}")
                if attempt + 1 == max_retries:
                    raise Exception("Failed to get recommendations from AI after several attempts.") from e
                
                # Exponential backoff
                time.sleep(delay)
                delay *= 2
