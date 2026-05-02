import os
import re
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}


def generate_itinerary_service(paths: List[List[Any]], budget: int, days: int) -> Dict[str, Any]:
    """
    Core service logic for generating an itinerary.
    Constructs the prompt, calls the AI, and parses the response.
    """
    # 1. Prompt Construction
    
    # Get unique destination names
    destinations = list(set([p[1].name for p in paths if len(p) == 2]))
    dest_str = ", ".join(destinations)
    
    path_descriptions = ", then ".join([f"from {p[0].name} to {p[1].name}" for p in paths if len(p) == 2])
    
    prompt = (
        "You are an expert AI Travel Assistant. Create a highly detailed and structured "
        f"travel itinerary for a trip {path_descriptions} "
        f"for a total duration of {days} days, with a total budget of ${budget}.\n\n"
        "First, provide a 'Destination Info' section for each unique destination: " + dest_str + ".\n"
        "Format for each destination:\n"
        "Destination: [Name]\n"
        "- Coordinates: [Latitude, Longitude]\n"
        "- Description: [2-3 sentence overview]\n"
        "- Estimated Cost: [Estimated price for travel and stay in USD]\n"
        "- Necessities: [Visas, weather, local tips]\n\n"
        "Please follow this exact format for each day:\n"
        "Day [Number]:\n"
        "- Activities: [List detailed activities]\n"
        "- Estimated cost: [Specific amount for the day, e.g. $150]\n\n"
        "Finally, provide a 'Trip Summary' section at the end:\n"
        "Trip Summary:\n"
        "- Total estimated cost: [Sum of all daily costs, e.g. $2500]\n"
        f"- Budget fit: [Yes/No, based on whether the total is within ${budget}]\n\n"
        "Do not use markdown bolding in headers like 'Destination:' or 'Day [Number]:'. Ensure the advice is practical and fits the specified budget."
    )

    # 2. AI Call
    raw_ai_text = _call_hf_inference(prompt)

    # 3. Parsing & Cleaning
    result = _parse_itinerary(raw_ai_text)
    
    # 4. Add images for destinations
    for dest in result.get("destinations", []):
        dest["image_url"] = _get_destination_image(dest["name"])
        
    return result


def _get_destination_image(location_name: str) -> str:
    """Helper to get a representative image URL for a destination."""
    # Using Unsplash source (legacy but works for featured photos) or a reliable alternative
    # Format: https://source.unsplash.com/featured/?{query}
    # Since source.unsplash.com is being phased out, we'll use a search redirect pattern if possible
    # or just a placeholder service that uses Unsplash.
    query = location_name.replace(" ", ",")
    return f"https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=1000&sig={query}"
    # Note: Real apps should use the Unsplash API directly.


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


def _parse_itinerary(text: str) -> Dict[str, Any]:
    """Helper to clean and structure the raw AI response."""
    # 1. Parse Destination Info
    structured_destinations = []
    dest_section_match = re.search(r"Destination Info:(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    if not dest_section_match:
        # Try finding destination blocks without the header
        dest_section_match = re.search(r"(?i)\*?\*?Destination:\*?\*?\s*(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    
    if dest_section_match:
        dest_text = dest_section_match.group(0)
        # We search from start of matched string to Day 1, ensuring we don't drop the first Destination if no header
        if "Destination Info:" not in dest_text:
            dest_text = text[:dest_section_match.end()]
            dest_text = re.sub(r"(?i)^.*?(?=\*?\*?Destination:)", "", dest_text, flags=re.DOTALL)
            
        dest_blocks = re.split(r"(?i)\*?\*?Destination:\*?\*?\s*", dest_text)
        for block in dest_blocks:
            if not block.strip() or "Info:" in block:
                continue
            lines = block.strip().split("\n")
            name = lines[0].strip().strip("*").strip()
            
            description = ""
            cost = ""
            necessities = ""
            lat = None
            lng = None
            
            # Extract fields using regex on the block to handle markdown robustly
            desc_match = re.search(r"(?i)Description:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if desc_match:
                description = desc_match.group(1).strip().strip("*").strip()
                
            cost_match = re.search(r"(?i)Estimated Cost:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if cost_match:
                cost = cost_match.group(1).strip().strip("*").strip()
                
            nec_match = re.search(r"(?i)Necessities:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if nec_match:
                necessities = nec_match.group(1).strip().strip("*").strip()
                
            coord_match = re.search(r"(?i)Coordinates:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if coord_match:
                coords_str = coord_match.group(1).strip().strip("*").strip()
                # Find all floating point numbers
                nums = re.findall(r"-?\d+(?:\.\d+)?", coords_str)
                if len(nums) >= 2:
                    try:
                        lat = float(nums[0])
                        lng = float(nums[1])
                    except Exception:
                        pass
                        
            structured_destinations.append({
                "name": name,
                "description": description,
                "estimated_price": cost,
                "necessities": necessities,
                "lat": lat,
                "lng": lng,
                "image_url": "" # To be filled by caller
            })

    # Cleaning: Strip conversational filler and destination info for the raw itinerary text
    cleaned = re.sub(r"^(.*?)(?=Day\s*1:)", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    cleaned = re.sub(r"(Enjoy your trip|Hope this helps|Let me know if).*$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()

    structured_days: List[Dict[str, Any]] = []
    
    # Parsing Day blocks
    day_blocks = re.split(r"Day\s*(\d+):", cleaned, flags=re.IGNORECASE)
    for i in range(1, len(day_blocks), 2):
        day_num = day_blocks[i]
        day_content = day_blocks[i+1].strip()
        
        if "trip summary" in day_content.lower():
            day_content = re.split(r"Trip Summary:", day_content, flags=re.IGNORECASE)[0].strip()

        cost_match = re.search(r"Estimated cost:\s*(.*)", day_content, re.IGNORECASE)
        cost = cost_match.group(1).strip() if cost_match else "Not specified"
        
        if cost_match:
            day_content = day_content.replace(cost_match.group(0), "")

        activities = [line.strip("- *").strip() for line in day_content.split("\n") if line.strip().startswith(("-", "*"))]

        structured_days.append({
            "day": int(day_num),
            "activities": activities,
            "cost": cost
        })

    # Parsing Trip Summary from full text for better reliability
    summary_data = {"total_cost": "Not specified", "budget_fit": "Unknown"}
    summary_match = re.search(r"Trip Summary:(.*)", text, re.IGNORECASE | re.DOTALL)
    if summary_match:
        summary_text = summary_match.group(1)
        total_match = re.search(r"Total estimated cost:\s*(.*)", summary_text, re.IGNORECASE)
        if total_match:
            summary_data["total_cost"] = total_match.group(1).strip().strip("*").strip()
        fit_match = re.search(r"Budget fit:\s*(.*)", summary_text, re.IGNORECASE)
        if fit_match:
            summary_data["budget_fit"] = fit_match.group(1).strip().strip("*").strip()

    return {
        "cleaned_text": cleaned,
        "days": structured_days,
        "destinations": structured_destinations,
        "summary": summary_data
    }
