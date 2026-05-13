import os
import re
import requests
from typing import Dict, Any, List, Optional, Union
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
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
    search_query: str = Field(..., description="Specific landmark name for image search")
    opening_hours: str = Field("Varies", description="Operating hours, e.g. 9 AM - 6 PM or 'Varies'")
    important_info: str = Field("N/A", description="Need to know info, e.g. 'Requires advance booking' or 'Best visited in the morning'")

class AIActivity(BaseModel):
    name: str = Field(..., description="Short activity name")
    description: str = Field(..., description="1-2 sentence description of the activity")
    estimated_cost: int = Field(..., description="Estimated cost in USD as an integer")
    lat: float = Field(..., description="Latitude of the activity location")
    lng: float = Field(..., description="Longitude of the activity location")
    search_query: str = Field(..., description="Specific landmark name for image search (e.g. 'Golden Gate Bridge')")
    opening_hours: str = Field("Varies", description="Operating hours, e.g. 9 AM - 6 PM or 'Varies'")
    important_info: str = Field("N/A", description="Need to know info, e.g. 'Requires advance booking' or 'Best visited in the morning'")

class AIDay(BaseModel):
    day: int = Field(..., description="Day number")
    origin: str = Field(..., description="Specific starting location name")
    origin_lat: Optional[float] = Field(None, description="Origin latitude")
    origin_lng: Optional[float] = Field(None, description="Origin longitude")
    destination: str = Field(..., description="Specific ending location name")
    destination_lat: Optional[float] = Field(None, description="Destination latitude")
    destination_lng: Optional[float] = Field(None, description="Destination longitude")
    image_query: str = Field(..., description="Specific landmark or activity name for image search")
    activities: List[AIActivity] = Field(..., description="List of 3-5 structured activities with coordinates")
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
    # The destination is where the traveler is going (index 1 of each path pair)
    dest_names = list(set([p[1].name for p in paths if len(p) == 2]))
    dest_str = ", ".join(dest_names)
    origin_names = list(set([p[0].name for p in paths if len(p) == 2]))
    origin_str = ", ".join(origin_names)

    prompt = (
        f"You are a travel planner. Create a {days}-day sightseeing itinerary for {dest_str} "
        f"(traveler arrives from {origin_str}, spending ${budget} total).\n\n"
        "Respond with ONLY a JSON object. The JSON must have EXACTLY these three top-level keys — "
        "no more, no fewer: \"destinations\", \"days\", \"summary\".\n\n"
        "Required structure:\n"
        "{\n"
        "  \"destinations\": [\n"
        f"    {{\"name\": \"landmark in {dest_str}\", \"description\": \"2-3 sentences\", "
        "\"estimated_price\": 0, \"necessities\": \"tips\", \"lat\": 0.0, \"lng\": 0.0, "
        "\"search_query\": \"Specific Landmark Name\", "
        "\"opening_hours\": \"hours\", \"important_info\": \"tips\"}}\n"
        "  ],\n"
        "  \"days\": [\n"
        f"    {{\"day\": 1, \"origin\": \"neighbourhood in {dest_str}\", \"origin_lat\": 0.0, \"origin_lng\": 0.0, "
        f"\"destination\": \"attraction in {dest_str}\", \"destination_lat\": 0.0, \"destination_lng\": 0.0, "
        "\"image_query\": \"landmark name\", "
        "\"activities\": ["
        f"{{\"name\": \"activity\", \"description\": \"1-2 sentences\", \"estimated_cost\": 0, \"lat\": 0.0, \"lng\": 0.0, "
        "\"search_query\": \"Specific Landmark Name\", "
        "\"opening_hours\": \"hours\", \"important_info\": \"tips\"}}"
        "], \"cost\": 0}\n"
        "  ],\n"
        f"  \"summary\": {{\"total_cost\": 0, \"budget_fit\": \"Yes\"}}\n"
        "}\n\n"
        "Rules (strictly follow):\n"
        f"- ALL locations must be physically inside {dest_str}. No {origin_str}, no airports, no transit.\n"
        "- \"destinations\": exactly 5 items.\n"
        "- \"days\": exactly {days} items, one per day.\n"
        "- Each day's \"activities\": 2 to 3 items ONLY.\n"
        "- All descriptions: 2 to 3 sentences. Include what the activity is, what to do there, and any critical 'need to know' info (like booking) and 'hours' for museums/stores.\n"
        f"- All lat/lng MUST be the exact, real GPS coordinates of the specific landmark. DO NOT use the city center or destination's general coordinates for individual activities.\n"
        "- Every activity must have its own accurate coordinates. If two activities are at the same place, they can share, but they must be AT that place.\n"
        "- Each \"search_query\" MUST be a specific, descriptive landmark name AND include the city name (e.g., \"Golden Gate Bridge Visitor Center, San Francisco\").\n"
        "- All cost fields must be integers.\n"
        f"- \"budget_fit\": \"Yes\" if total_cost <= {budget}, otherwise \"No\".\n"
        "- Do NOT add any key other than \"destinations\", \"days\", \"summary\" at the top level.\n"
        "- Output the JSON only — no markdown, no explanation.\n"
        "- Ensure the JSON is complete and valid. High token limit (16,000) is provided for detailed responses."
    )

    # 2. AI Call + parse with one automatic retry on validation failure
    last_error: Exception = RuntimeError("No attempts made")
    result = None
    for attempt in range(2):
        try:
            raw_ai_text = _call_hf_inference(prompt)
            result = _parse_itinerary(raw_ai_text)
            break  # success — exit retry loop
        except RuntimeError as e:
            last_error = e
            print(f"Attempt {attempt + 1}/2 failed: {e}")
            if attempt == 0:
                print("Retrying with a fresh AI call...")

    if result is None:
        raise last_error

    print("Structured Result:", result)

    # 4. Fetch images for destinations, day headers, and every activity concurrently.
    #    Google Places on the frontend is used as the primary source; these URLs
    #    are the guaranteed fallback so an image always appears.
    tasks: list[tuple[dict, str, str]] = []
    for dest in result.get("destinations", []):
        tasks.append((dest, dest.get("search_query") or dest["name"], dest_str))
    for day in result.get("days", []):
        query = day.get("image_query") or day.get("destination") or "travel"
        tasks.append((day, query, dest_str))
        for activity in day.get("activities", []):
            tasks.append((activity, activity.get("search_query") or activity["name"], dest_str))

    def _fetch(item: tuple[dict, str, str]):
        obj, name, ctx = item
        return obj, _get_image_url(name, ctx)

    with ThreadPoolExecutor(max_workers=16) as pool:
        futures = {pool.submit(_fetch, t): t for t in tasks}
        for fut in as_completed(futures):
            obj, url = fut.result()
            obj["image_url"] = url

    return result


_STRIP_PREFIXES = re.compile(
    r"^(visit|explore|see|take a|take the|enjoy|discover|walk through|walk to|"
    r"stroll through|head to|go to|try|attend|experience|a |the )\s*",
    re.IGNORECASE,
)

def _clean_image_query(name: str, destination: str = "") -> str:
    """Strip travel-verb prefixes and append destination for better image results."""
    cleaned = _STRIP_PREFIXES.sub("", name).strip()
    # Remove parentheticals like "(optional)" or "(half day)"
    cleaned = re.sub(r"\s*\(.*?\)", "", cleaned).strip()
    if destination:
        return f"{cleaned} {destination}"
    return cleaned


def _get_wiki_image(name: str, destination: str = "") -> str:
    """Fetch a real photo from Wikipedia. Returns URL or empty string on failure."""
    query = _clean_image_query(name, destination)
    base = "https://en.wikipedia.org/w/api.php"
    try:
        # Step 1: find best-matching article title
        search = requests.get(base, params={
            "action": "query", "list": "search", "srsearch": query,
            "format": "json", "srlimit": 1,
        }, timeout=6)
        results = search.json().get("query", {}).get("search", [])
        if not results:
            return ""

        title = results[0]["title"]

        # Step 2: get its thumbnail
        img_resp = requests.get(base, params={
            "action": "query", "titles": title, "prop": "pageimages",
            "format": "json", "pithumbsize": 800,
        }, timeout=6)
        pages = img_resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            src = page.get("thumbnail", {}).get("source", "")
            if src:
                return src
    except Exception:
        pass
    return ""


def _get_image_url(name: str, destination: str = "") -> str:
    """Return a realistic photo URL, falling back to loremflickr."""
    url = _get_wiki_image(name, destination)
    if url:
        return url
    # Second attempt: just the name (sometimes destination name confuses Wikipedia)
    url = _get_wiki_image(name)
    if url:
        return url
    
    # Final fallback: A high-quality, guaranteed generic travel photo (no cats)
    return "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=60"


def _call_hf_inference(prompt: str) -> str:
    """Helper to communicate with Hugging Face Router."""
    if not HF_API_KEY:
        raise ValueError("HF_API_KEY is not set. Please add it to your .env file.")

    payload = {
        "model": HF_MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional travel agent that only outputs valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 16000,
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }

    try:
        response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=60)
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
        raw_content = data["choices"][0]["message"]["content"].strip()
        # Debug log for investigation
        with open("ai_response_debug.log", "w") as f:
            f.write(raw_content)
        return raw_content
    
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
    json_str = text.strip()
    if "```json" in text:
        json_str = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        json_str = text.split("```")[1].split("```")[0].strip()
    
    # Clean up any leading/trailing text that isn't JSON
    start_idx = json_str.find("{")
    end_idx = json_str.rfind("}")
    if start_idx != -1 and end_idx != -1:
        json_str = json_str[start_idx : end_idx + 1]

    # Post-processing to handle common AI JSON mistakes
    # 1. Remove trailing commas before closing braces/brackets
    json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
    
    # 2. Fix potential issues with control characters
    json_str = json_str.replace('\n', ' ').replace('\r', ' ')
    
    # 3. Attempt to fix common AI mistake where it uses a comma instead of a colon for "days" or "summary"
    json_str = re.sub(r'"(days|summary|destinations)"\s*,\s*(\[|{)', r'"\1": \2', json_str)
    
    # 3b. Fix extra brace before "days" (e.g. '}, {"days":')
    json_str = re.sub(r'\}\s*,\s*\{\s*"(days|summary)"', r', "\1"', json_str)
    
    # 4. Fix accidental backslashes before quotes in keys (e.g. \"summary\")
    json_str = json_str.replace('\\"', '"')
    
    # 5. Attempt to fix common unescaped quote issues in "key": "value" pairs

    try:
        data = json.loads(json_str)
        # Validate with Pydantic
        try:
            itinerary_data = AIItineraryResponse(**data)
        except Exception as ve:
            print(f"Pydantic Validation Error: {ve}")
            with open("failed_pydantic_validation.json", "w") as f:
                f.write(json.dumps(data, indent=2))
            raise ve
            
        # Convert back to dict and add cleaned_text for compatibility
        result = itinerary_data.model_dump()
        
        # Construct a "cleaned_text" field for compatibility if needed
        days_text = []
        for d in result["days"]:
            days_text.append(f"Day {d['day']}: {d['origin']} to {d['destination']}")
        result["cleaned_text"] = "\n".join(days_text)
        
        return result
        
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Failed to parse AI JSON: {e}")
        # Log the problematic string to a file for investigation
        with open("failed_json_parse.txt", "w") as f:
            f.write(json_str)
        raise RuntimeError(f"Failed to parse itinerary JSON: {str(e)}")
