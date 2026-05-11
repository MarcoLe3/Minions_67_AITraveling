import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from ai.itinerary import _parse_itinerary
import json

mock_ai_response = """
Here is your itinerary:

```json
{
  "destinations": [
    {
      "name": "Paris",
      "description": "The city of lights and love.",
      "estimated_price": 1000,
      "necessities": "Visa required for some, pack for rain.",
      "lat": 48.8566,
      "lng": 2.3522
    }
  ],
  "days": [
    {
      "day": 1,
      "origin": "Charles de Gaulle Airport",
      "origin_lat": 49.0097,
      "origin_lng": 2.5479,
      "destination": "Marriott Paris Opera Hotel",
      "destination_lat": 48.8719,
      "destination_lng": 2.3323,
      "image_query": "Eiffel Tower at night",
      "activities": ["Check-in", "Dinner at Le Relais de l'Entrecote"],
      "cost": 200
    }
  ],
  "summary": {
    "total_cost": 1200,
    "budget_fit": "Yes"
  }
}
```

Enjoy your trip!
"""

def test_parsing():
    try:
        result = _parse_itinerary(mock_ai_response)
        print("Parsing successful!")
        print(json.dumps(result, indent=2))
        
        assert len(result["destinations"]) == 1
        assert result["destinations"][0]["name"] == "Paris"
        assert len(result["days"]) == 1
        assert result["days"][0]["origin"] == "Charles de Gaulle Airport"
        assert result["summary"]["total_cost"] == 1200
        print("Assertions passed!")
    except Exception as e:
        print(f"Parsing failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_parsing()
