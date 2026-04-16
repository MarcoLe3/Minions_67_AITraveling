import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

payload = {
    "model": HF_MODEL,
    "messages": [
        {"role": "system", "content": "You are a professional travel agent."},
        {"role": "user", "content": "Test prompt"}
    ],
    "max_tokens": 512,
    "temperature": 0.7,
}

print(f"Testing URL: {HF_API_URL}")
print(f"Testing Model: {HF_MODEL}")

try:
    response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
    response.raise_for_status()
except Exception as e:
    print(f"Error: {e}")
