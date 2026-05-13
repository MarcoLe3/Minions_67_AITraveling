from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.itinerary import ItineraryRequest, ItineraryResponse, Journey
from ai.itinerary import generate_itinerary_service

"""
AI Travel Agent API
Step 9: Refactored structure - Main entry point is now focused strictly on routing.
"""

app = FastAPI(title="AI Travel Agent API", version="1.1.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
            paths=request.paths,
            budget=request.budget,
            days=request.days
        )

        journeys = [
            Journey(
                origin=path[0].name,
                origin_lat=path[0].lat,
                origin_lng=path[0].lng,
                destination=path[1].name,
                destination_lat=path[1].lat,
                destination_lng=path[1].lng,
            )
            for path in request.paths
            if len(path) == 2
        ]

        clean_res = ItineraryResponse(
            itinerary=result["cleaned_text"],
            days=result["days"],
            destinations=result["destinations"],
            journeys=journeys,
            summary=result["summary"],
            success=True
        )

        print("gibbersih", clean_res)
        return clean_res
    except Exception as e:
        # Unified error handling for the endpoint
        return ItineraryResponse(
            itinerary="", 
            success=False, 
            error=str(e)
        )
