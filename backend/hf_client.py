import os
import re
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Loads variables from backend/.env into the process environment.
# Must be called before any os.getenv() calls.
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
# Using a model supported by HF Inference Providers (Serverless)
HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
# HF migrated to a new 'router' infrastructure in 2025. 
# We use the Chat Completions API for better prompt handling and automatic provider routing.
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}


def generate_itinerary_with_hf(prompt: str) -> str:
    """
    Sends a prompt to the Hugging Face Inference API and returns the generated text.

    Args:
        prompt: The travel itinerary prompt to send to the model.

    Returns:
        The generated text string from the model.

    Raises:
        ValueError: If HF_API_KEY is not set in the environment.
        RuntimeError: If the API request fails or returns an unexpected response.
    """
    if not HF_API_KEY:
        raise ValueError("HF_API_KEY is not set. Please add it to your .env file.")

    # The new Inference Router uses the Chat Completions format (messages)
    # mirroring the OpenAI API structure.
    payload = {
        "model": HF_MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional travel agent."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 512,
        "temperature": 0.7,
    }

    try:
        response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=30)
    except requests.exceptions.Timeout:
        raise RuntimeError("The request to Hugging Face timed out. Please try again later.")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"A network error occurred while connecting to Hugging Face: {str(e)}")

    if response.status_code != 200:
        # Provide a more descriptive error if we can parse it from the body
        try:
            err_msg = response.json().get("error", response.text)
        except Exception:
            err_msg = response.text
        raise RuntimeError(f"Hugging Face API error ({response.status_code}): {err_msg}")

    data = response.json()

    # The new Chat Completion response format nestles the text in choices -> message -> content.
    if "choices" in data and len(data["choices"]) > 0:
        raw_text = data["choices"][0]["message"]["content"].strip()
        return parse_itinerary(raw_text)

    raise RuntimeError(f"Unexpected response format from Hugging Face API: {data}")


def parse_itinerary(text: str) -> Dict[str, Any]:
    """
    Cleans raw AI text and parses it into a structured dictionary.
    
    Returns:
        A dictionary with 'cleaned_text', 'days' (list), and 'summary' (dict).
    """
    # 1. Cleaning: Strip common AI conversational artifacts
    # Remove leading filler text like "Certainly! Here is your plan:" or "Sure, I can help!"
    # Using [^]* or similar to match across lines until the first "Day"
    cleaned = re.sub(r"^(.*?)(?=Day\s*1:)", "", text, flags=re.IGNORECASE | re.DOTALL).strip()
    
    # Also strip trailing filler like "Hope this helps!" or "Enjoy your trip!"
    # We strip starting from the end of the Summary fit-line or known closing phrases
    cleaned = re.sub(r"(Enjoy your trip|Hope this helps|Let me know if).*$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()

    structured_days: List[Dict[str, Any]] = []
    
    # 2. Parsing Days: Look for Day [Number]: blocks
    # Regex captures the Day number and the content until the next Day or Trip Summary
    day_blocks = re.split(r"Day\s*(\d+):", cleaned, flags=re.IGNORECASE)
    
    # day_blocks[0] is text before Day 1
    # Subsequent elements come in pairs: [Number, Content]
    for i in range(1, len(day_blocks), 2):
        day_num = day_blocks[i]
        day_content = day_blocks[i+1].strip()
        
        # Stop if we hit the Trip Summary
        if "trip summary" in day_content.lower():
            day_content = re.split(r"Trip Summary:", day_content, flags=re.IGNORECASE)[0].strip()

        # Extract Activities and Cost from the day block
        activities = []
        cost = "Not specified"
        
        # Look for the cost line
        cost_match = re.search(r"Estimated cost:\s*(.*)", day_content, re.IGNORECASE)
        if cost_match:
            cost = cost_match.group(1).strip()
            # Remove the cost line from activities
            day_content = day_content.replace(cost_match.group(0), "")

        # Extract activities (lines starting with - or *)
        activities = [line.strip("- *").strip() for line in day_content.split("\n") if line.strip().startswith(("-", "*"))]

        structured_days.append({
            "day": int(day_num),
            "activities": activities,
            "cost": cost
        })

    # 3. Parsing Summary
    summary_data = {"total_cost": "Not specified", "budget_fit": "Unknown"}
    summary_match = re.search(r"Trip Summary:(.*)", cleaned, re.IGNORECASE | re.DOTALL)
    if summary_match:
        summary_text = summary_match.group(1)
        
        total_match = re.search(r"Total estimated cost:\s*(.*)", summary_text, re.IGNORECASE)
        if total_match:
            summary_data["total_cost"] = total_match.group(1).strip()
            
        fit_match = re.search(r"Budget fit:\s*(.*)", summary_text, re.IGNORECASE)
        if fit_match:
            summary_data["budget_fit"] = fit_match.group(1).strip()

    return {
        "cleaned_text": cleaned,
        "days": structured_days,
        "summary": summary_data
    }


#  Quick manual test 
if __name__ == "__main__":
    test_prompt = (
        "Create a 3-day travel itinerary for a trip from New York to Paris "
        "with a budget of $2000. Include daily activities, meals, and transport tips."
    )
    print("Sending prompt to Hugging Face...\n")
    result = generate_itinerary_with_hf(test_prompt)
    print("Generated Itinerary:\n")
    print(result)
