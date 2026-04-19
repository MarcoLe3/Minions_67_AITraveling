from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

"""
Pydantic models for the AI Travel Agent.
These handle automatic input validation and response schema definition.
"""

class ItineraryRequest(BaseModel):
    paths: List[List[str]] = Field(..., description="List of travel paths, e.g. [['origin', 'destination']]")
    budget: int = Field(..., gt=0, description="Total budget must be greater than 0")
    days: int = Field(..., gt=0, description="Number of days must be greater than 0")


class ItineraryResponse(BaseModel):
    itinerary: str # Cleaned raw text
    days: List[Dict[str, Any]] = [] # Structured day-by-day data
    summary: Dict[str, Any] = {} # Structured summary data
    success: bool
    error: Optional[str] = None
