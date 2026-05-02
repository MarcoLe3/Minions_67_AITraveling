from models.itinerary import Location
from ai.itinerary import generate_itinerary_service

# Create a mock path
loc1 = Location(name="San Francisco")
loc2 = Location(name="Tokyo")
paths = [[loc1, loc2]]

try:
    result = generate_itinerary_service(paths=paths, budget=1500, days=5)
    print("RAW AI TEXT:")
    print(result.get("cleaned_text"))
    print("\nDESTINATIONS:")
    import json
    print(json.dumps(result.get("destinations", []), indent=2))
except Exception as e:
    print(f"Error: {e}")
