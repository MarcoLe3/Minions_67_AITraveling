from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    origin: str
    destination: str
    budget: int
    days: int


class ItineraryResponse(BaseModel):
    itinerary: str


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
        itinerary = generate_itinerary_with_hf(prompt)
    except (ValueError, RuntimeError) as e:
        # Surface API/config errors as a proper HTTP 500 instead of crashing
        raise HTTPException(status_code=500, detail=str(e))

    return ItineraryResponse(itinerary=itinerary)
