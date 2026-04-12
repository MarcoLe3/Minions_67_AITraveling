import os
import requests
from dotenv import load_dotenv

# Loads variables from backend/.env into the process environment.
# Must be called before any os.getenv() calls.
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
# HF migrated from api-inference.huggingface.co to this router endpoint in 2025.
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}"

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

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 512,   # cap response length to avoid timeouts
            "temperature": 0.7,      # 0 = deterministic, 1 = more creative
            "return_full_text": False,  # only return the new text, not the prompt
        },
    }

    response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=30)

    if response.status_code != 200:
        raise RuntimeError(
            f"Hugging Face API error {response.status_code}: {response.text}"
        )

    data = response.json()

    # HF returns a list of dicts: [{"generated_text": "..."}]
    if isinstance(data, list) and len(data) > 0:
        return data[0].get("generated_text", "").strip()

    raise RuntimeError(f"Unexpected response format from Hugging Face API: {data}")


# ── Quick manual test ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_prompt = (
        "Create a 3-day travel itinerary for a trip from New York to Paris "
        "with a budget of $2000. Include daily activities, meals, and transport tips."
    )
    print("Sending prompt to Hugging Face...\n")
    result = generate_itinerary_with_hf(test_prompt)
    print("Generated Itinerary:\n")
    print(result)
