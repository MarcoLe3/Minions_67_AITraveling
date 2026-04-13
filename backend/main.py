from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from hf_client import generate_itinerary_with_hf

app = FastAPI(title="AI Travel Agent API", version="1.0.0")
# Auto-generated interactive docs available at http://localhost:8000/docs when running

# allow the Next.js frontend to call this API during local development.
# in production, replace "http://localhost:3000" with the deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models handle input validation automatically —
# FastAPI will return a 422 error if the client sends wrong types or missing fields.
class ItineraryRequest(BaseModel):
    origin: str = Field(..., min_length=1, description="Starting location")
    destination: str = Field(..., min_length=1, description="Target destination")
    budget: int = Field(..., gt=0, description="Total budget must be greater than 0")
    days: int = Field(..., gt=0, description="Number of days must be greater than 0")


class ItineraryResponse(BaseModel):
    itinerary: str # Cleaned raw text
    days: List[Dict[str, Any]] = [] # Structured day-by-day data
    summary: Dict[str, Any] = {} # Structured summary data
    success: bool
    error: Optional[str] = None


@app.get("/")
def root():
    return {"message": "AI Travel Agent API is running"}


@app.post("/generate-itinerary", response_model=ItineraryResponse)
def generate_itinerary(request: ItineraryRequest):
    """
    Builds a travel prompt from the user's input and returns an AI-generated itinerary.
    """
    # Step 4: Improved Prompt Engineering
    # We use a system-style instruction to set the persona and enforce a strict output schema.
    # This helps the LLM provide consistent, parseable, and professional responses.
    prompt = (
        "You are an expert AI Travel Assistant. Create a highly detailed and structured "
        f"travel itinerary for a trip from {request.origin} to {request.destination} "
        f"for a duration of {request.days} days, with a total budget of ${request.budget}.\n\n"
        "Please follow this exact format for each day:\n"
        "Day [Number]:\n"
        "- Activities: [List detailed activities]\n"
        "- Estimated cost: [Specific amount for the day]\n\n"
        "Finally, provide a 'Trip Summary' section at the end:\n"
        "Trip Summary:\n"
        "- Total estimated cost: [Sum of all daily costs]\n"
        f"- Budget fit: [Yes/No, based on whether the total is within ${request.budget}]\n\n"
        "Ensure the advice is practical and fits the specified budget."
    )

    try:
        # Call our Hugging Face client to get the text generation result.
        # Now returns a dictionary with 'cleaned_text', 'days', and 'summary'.
        result = generate_itinerary_with_hf(prompt)
        
        return ItineraryResponse(
            itinerary=result["cleaned_text"],
            days=result["days"],
            summary=result["summary"],
            success=True
        )
    except (ValueError, RuntimeError) as e:
        # If the API key is missing or the HF service returns an error,
        # we return success=False along with the error message.
        return ItineraryResponse(
            itinerary="", 
            success=False, 
            error=str(e)
        )
