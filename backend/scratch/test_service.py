from models.itinerary import Location
from ai.itinerary import generate_itinerary_service

# Create a mock path
loc1 = Location(name="San Francisco")
loc2 = Location(name="Tokyo")
paths = [[loc1, loc2]]

try:
    result = generate_itinerary_service(paths=paths, budget=1500, days=5)
    print("Destinations:")
    for dest in result.get("destinations", []):
        print(f"- {dest.get('name')}: lat={dest.get('lat')}, lng={dest.get('lng')}")
except Exception as e:
    print(f"Error: {e}")
