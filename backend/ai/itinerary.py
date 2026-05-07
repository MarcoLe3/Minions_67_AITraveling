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
    print("beginning")
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
        "- Estimated Cost: [Provide an integer amount only, e.g. 500]\n"
        "- Necessities: [Visas, weather, local tips]\n\n"
        "Please follow this exact format for each day:\n"
        "Day [Number]:\n"
        "- Origin: [Starting location for the day]\n"
        "- Destination: [Main destination or ending location for the day]\n"
        "- Image Query: [A specific landmark or activity name for image search]\n"
        "- Activities: [List detailed activities]\n"
        "- Estimated cost: [Specific integer amount for the day, e.g. 150. If it is a range, provide the average as an integer.]\n\n"
        "Finally, provide a 'Trip Summary' section at the end:\n"
        "Trip Summary:\n"
        "- Total estimated cost: [Sum of all daily costs as an integer, e.g. 2500]\n"
        f"- Budget fit: [Yes/No, based on whether the total is within ${budget}]\n\n"
        "Do not use markdown bolding in headers like 'Destination:' or 'Day [Number]:'. Ensure the advice is practical and fits the specified budget."
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
    # 1. Parse Destination Info
    structured_destinations = []
    dest_section_match = re.search(r"Destination Info:(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    if not dest_section_match:
        # Try finding destination blocks without the header
        dest_section_match = re.search(r"(?i)\*?\*?Destination:\*?\*?\s*(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    
    if dest_section_match:
        dest_text = dest_section_match.group(0)
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
            cost_str = ""
            necessities = ""
            lat = None
            lng = None
            
            desc_match = re.search(r"(?i)Description:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if desc_match:
                description = desc_match.group(1).strip().strip("*").strip()
                
            cost_match = re.search(r"(?i)Estimated Cost:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if cost_match:
                cost_str = cost_match.group(1).strip().strip("*").strip()
                
            nec_match = re.search(r"(?i)Necessities:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if nec_match:
                necessities = nec_match.group(1).strip().strip("*").strip()
                
            coord_match = re.search(r"(?i)Coordinates:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if coord_match:
                coords_str = coord_match.group(1).strip().strip("*").strip()
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
                "estimated_price": _parse_cost_to_int(cost_str),
                "necessities": necessities,
                "lat": lat,
                "lng": lng,
                "image_url": "" 
            })

    # Cleaning
    cleaned = re.sub(r"^(.*?)(?=Day\s*1:)", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    cleaned = re.sub(r"(Enjoy your trip|Hope this helps|Let me know if).*$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()

    structured_days = []
    day_blocks = re.split(r"Day\s*(\d+):", cleaned, flags=re.IGNORECASE)
    for i in range(1, len(day_blocks), 2):
        day_num = day_blocks[i]
        day_content = day_blocks[i+1].strip()
        
        if "trip summary" in day_content.lower():
            day_content = re.split(r"Trip Summary:", day_content, flags=re.IGNORECASE)[0].strip()

        # Extracting new fields
        origin = ""
        origin_match = re.search(r"(?i)Origin:\s*(.*)", day_content)
        if origin_match:
            origin = origin_match.group(1).strip()
            day_content = day_content.replace(origin_match.group(0), "")

        destination = ""
        dest_match = re.search(r"(?i)Destination:\s*(.*)", day_content)
        if dest_match:
            destination = dest_match.group(1).strip()
            day_content = day_content.replace(dest_match.group(0), "")

        image_query = ""
        img_match = re.search(r"(?i)Image Query:\s*(.*)", day_content)
        if img_match:
            image_query = img_match.group(1).strip()
            day_content = day_content.replace(img_match.group(0), "")

        cost_str = "0"
        cost_match = re.search(r"(?i)Estimated cost:\s*(.*)", day_content)
        if cost_match:
            cost_str = cost_match.group(1).strip()
            day_content = day_content.replace(cost_match.group(0), "")

        activities = [line.strip("- *").strip() for line in day_content.split("\n") if line.strip().startswith(("-", "*"))]

        structured_days.append({
            "day": int(day_num),
            "origin": origin,
            "destination": destination,
            "image_query": image_query, # Helper field
            "activities": activities,
            "cost": _parse_cost_to_int(cost_str),
            "image_url": "" # To be filled
        })

    summary_data = {"total_cost": 0, "budget_fit": "Unknown"}
    summary_match = re.search(r"Trip Summary:(.*)", text, re.IGNORECASE | re.DOTALL)
    if summary_match:
        summary_text = summary_match.group(1)
        total_match = re.search(r"Total estimated cost:\s*(.*)", summary_text, re.IGNORECASE)
        if total_match:
            summary_data["total_cost"] = _parse_cost_to_int(total_match.group(1))
        fit_match = re.search(r"Budget fit:\s*(.*)", summary_text, re.IGNORECASE)
        if fit_match:
            summary_data["budget_fit"] = fit_match.group(1).strip().strip("*").strip()

    return {
        "cleaned_text": cleaned,
        "days": structured_days,
        "destinations": structured_destinations,
        "summary": summary_data
    }
