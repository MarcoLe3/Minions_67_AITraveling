from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.itinerary import ItineraryRequest, ItineraryResponse
from ai.itinerary import generate_itinerary_service

"""
AI Travel Agent API
Step 9: Refactored structure - Main entry point is now focused strictly on routing.
"""

app = FastAPI(title="AI Travel Agent API", version="1.1.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "AI Travel Agent API is running - Refactored Structure"}


@app.post("/generate-itinerary", response_model=ItineraryResponse)
def generate_itinerary(request: ItineraryRequest):
    """
    Refactored endpoint: Delegates core logic to the AI service module.
    """
    try:
        # Business logic is now encapsulated in ai/itinerary.py
        result = generate_itinerary_service(
            origin=request.origin,
            destination=request.destination,
            budget=request.budget,
            days=request.days
        )
        
        return ItineraryResponse(
            itinerary=result["cleaned_text"],
            days=result["days"],
            summary=result["summary"],
            success=True
        )
    except Exception as e:
        # Unified error handling for the endpoint
        return ItineraryResponse(
            itinerary="", 
            success=False, 
            error=str(e)
        )
