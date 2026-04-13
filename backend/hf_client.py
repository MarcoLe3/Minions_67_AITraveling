import os
import requests
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
        return data["choices"][0]["message"]["content"].strip()

    raise RuntimeError(f"Unexpected response format from Hugging Face API: {data}")


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
