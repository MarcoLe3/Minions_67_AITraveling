import os
import re
import requests
from typing import Dict, Any, List, Optional, Union
import json
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}


# --- Pydantic Models for AI Output ---

class AIDestination(BaseModel):
    name: str = Field(..., description="Name of the destination")
    description: str = Field(..., description="2-3 sentence overview")
    estimated_price: int = Field(..., description="Estimated cost as an integer")
    necessities: str = Field(..., description="Visas, weather, local tips")
    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")

class AIDay(BaseModel):
    day: int = Field(..., description="Day number")
    origin: str = Field(..., description="Specific starting location name")
    origin_lat: Optional[float] = Field(None, description="Origin latitude")
    origin_lng: Optional[float] = Field(None, description="Origin longitude")
    destination: str = Field(..., description="Specific ending location name")
    destination_lat: Optional[float] = Field(None, description="Destination latitude")
    destination_lng: Optional[float] = Field(None, description="Destination longitude")
    image_query: str = Field(..., description="Specific landmark or activity name for image search")
    activities: List[str] = Field(..., description="List of detailed activities")
    cost: int = Field(..., description="Specific integer amount for the day")

class AISummary(BaseModel):
    total_cost: int = Field(..., description="Sum of all daily costs as an integer")
    budget_fit: str = Field(..., description="Yes/No, based on whether the total is within budget")

class AIItineraryResponse(BaseModel):
    destinations: List[AIDestination]
    days: List[AIDay]
    summary: AISummary


# --- Service Logic ---

def generate_itinerary_service(paths: List[List[Any]], budget: int, days: int) -> Dict[str, Any]:
    """
    Core service logic for generating an itinerary.
    Constructs the prompt, calls the AI, and parses the response.
    """
    # 1. Prompt Construction
    print("beginning")
    # Get unique destination names
    destinations = list(set([p[1].name for p in paths if len(p) == 2]))
    dest_str = ", ".join(destinations)
    
    path_descriptions = ", then ".join([f"from {p[0].name} to {p[1].name}" for p in paths if len(p) == 2])
    
    prompt = (
        "You are an expert AI Travel Assistant. Create a highly detailed and structured "
        f"travel itinerary for a trip {path_descriptions} "
        f"for a total duration of {days} days, with a total budget of ${budget}.\n\n"
        "Return the itinerary in JSON format matching this structure:\n"
        "{\n"
        "  \"destinations\": [\n"
        "    {\n"
        "      \"name\": \"City/Place Name\",\n"
        "      \"description\": \"Overview\",\n"
        "      \"estimated_price\": 500,\n"
        "      \"necessities\": \"Tips/Weather/Visas\",\n"
        "      \"lat\": float, \"lng\": float\n"
        "    }\n"
        "  ],\n"
        "  \"days\": [\n"
        "    {\n"
        "      \"day\": 1,\n"
        "      \"origin\": \"Specific Hotel/Landmark\",\n"
        "      \"origin_lat\": float, \"origin_lng\": float,\n"
        "      \"destination\": \"Specific Attraction/Restaurant\",\n"
        "      \"destination_lat\": float, \"destination_lng\": float,\n"
        "      \"image_query\": \"Specific landmark for images\",\n"
        "      \"activities\": [\"Activity 1\", \"Activity 2\"],\n"
        "      \"cost\": 150\n"
        "    }\n"
        "  ],\n"
        "  \"summary\": {\n"
        "    \"total_cost\": total_sum,\n"
        "    \"budget_fit\": \"Yes/No\"\n"
        "  }\n"
        "}\n\n"
        "IMPORTANT: Be extremely specific with Origin and Destination names (e.g. use specific hotel names, landmarks, or restaurants, NOT just the city name). "
        "Provide precise coordinates for every origin and destination. "
        "All costs MUST be integers. "
        "Return ONLY the JSON object."
    )

    # 2. AI Call
    raw_ai_text = _call_hf_inference(prompt)

    # 3. Parsing & Cleaning
    result = _parse_itinerary(raw_ai_text)
    
    print("Structured Result:", result)  # Debugging output to verify parsing
    
    # 4. Add images for destinations and days
    for dest in result.get("destinations", []):
        dest["image_url"] = _get_image_url(dest["name"])
        
    for day in result.get("days", []):
        query = day.get("image_query") or day.get("destination") or "travel"
        day["image_url"] = _get_image_url(query)
        
    return result


def _get_image_url(query: str) -> str:
    """Helper to get a representative image URL."""
    clean_query = query.replace(" ", ",").lower()
    # Using LoremFlickr which is more reliable for simple queries than the phased-out source.unsplash.com
    return f"https://loremflickr.com/800/600/{clean_query}"


def _call_hf_inference(prompt: str) -> str:
    """Helper to communicate with Hugging Face Router."""
    if not HF_API_KEY:
        raise ValueError("HF_API_KEY is not set. Please add it to your .env file.")

    payload = {
        "model": HF_MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional travel agent."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1024,
        "temperature": 0.7,
    }

    try:
        response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise RuntimeError("The request to Hugging Face timed out.")
    except requests.exceptions.HTTPError as e:
        error_detail = response.json() if response.content else response.text
        raise RuntimeError(f"Hugging Face API error: {str(e)} - {error_detail}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {str(e)}")

    data = response.json()
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"].strip()
    
    raise RuntimeError("Unexpected response format from AI service.")


def _parse_cost_to_int(cost_str: str) -> int:
    """Helper to parse a cost string into an integer, averaging ranges."""
    if not cost_str:
        return 0
    # Find all numbers in the string
    nums = re.findall(r"\d+", cost_str.replace(",", ""))
    if not nums:
        return 0
    
    # Convert to integers
    int_nums = [int(n) for n in nums]
    
    # If it's a range (2 numbers), return the average
    if len(int_nums) >= 2:
        return int(sum(int_nums[:2]) / 2)
    
    return int_nums[0]


def _parse_itinerary(text: str) -> Dict[str, Any]:
    """Helper to clean and structure the raw AI response."""
    # 1. Extract JSON from text (in case it's wrapped in markdown blocks)
    json_str = text
    if "```json" in text:
        json_str = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        json_str = text.split("```")[1].split("```")[0].strip()
    
    # Clean up any leading/trailing text that isn't JSON
    start_idx = json_str.find("{")
    end_idx = json_str.rfind("}")
    if start_idx != -1 and end_idx != -1:
        json_str = json_str[start_idx : end_idx + 1]

    try:
        data = json.loads(json_str)
        # Validate with Pydantic
        itinerary_data = AIItineraryResponse(**data)
        
        # Convert back to dict and add cleaned_text for compatibility
        result = itinerary_data.model_dump()
        
        # Construct a "cleaned_text" field for compatibility if needed
        # (Though structured data is preferred now)
        days_text = []
        for d in result["days"]:
            days_text.append(f"Day {d['day']}: {d['origin']} to {d['destination']}")
        result["cleaned_text"] = "\n".join(days_text)
        
        return result
        
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Failed to parse AI JSON: {e}")
        print("Raw text:", text)
        # Fallback or re-raise
        raise RuntimeError(f"Failed to parse itinerary JSON: {str(e)}")
