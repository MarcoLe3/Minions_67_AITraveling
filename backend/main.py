from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Travel Agent API", version="1.0.0")

# Allow requests from the Next.js frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return ItineraryResponse(itinerary="Test itinerary")
