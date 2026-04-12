from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    Accepts travel details and returns a generated itinerary.
    Placeholder response — AI integration comes next.
    """
    # STEP 2: replace this with a call to generate_itinerary_with_hf()
    return ItineraryResponse(itinerary="Test itinerary")
