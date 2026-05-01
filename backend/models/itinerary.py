from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

"""
Pydantic models for the AI Travel Agent.
These handle automatic input validation and response schema definition.
"""

class Location(BaseModel):
    name: str = Field(..., description="Name of the location")
    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")

class ItineraryRequest(BaseModel):
    paths: List[List[Location]] = Field(..., description="List of travel paths, e.g. [[origin_location, dest_location]]")
    budget: int = Field(..., gt=0, description="Total budget must be greater than 0")
    days: int = Field(..., gt=0, description="Number of days must be greater than 0")


class DestinationDetail(BaseModel):
    name: str
    image_url: str
    description: str
    estimated_price: str
    necessities: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class ItineraryResponse(BaseModel):
    itinerary: str # Cleaned raw text
    days: List[Dict[str, Any]] = [] # Structured day-by-day data
    destinations: List[DestinationDetail] = [] # Detailed info for each stop
    summary: Dict[str, Any] = {} # Structured summary data
    success: bool
    error: Optional[str] = None
