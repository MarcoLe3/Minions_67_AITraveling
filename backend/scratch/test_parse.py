from ai.itinerary import _parse_itinerary

raw = """
Destination Info: Tokyo, San Francisco.

Destination: San Francisco
- Coordinates: 37.7749, -122.4194
- Description: San Francisco is a vibrant city.
- Estimated Cost: $200
- Necessities: Visas not required.

Destination: Tokyo
- Coordinates: 35.6762, 139.6503
- Description: Tokyo is a bustling metropolis.
- Estimated Cost: $300
- Necessities: Visas not required.

Day 1:
- Activities: Visit Golden Gate Bridge
- Estimated cost: $50
"""

result = _parse_itinerary(raw)
for d in result['destinations']:
    print(f"Name: {d['name']}, Lat: {d['lat']}, Lng: {d['lng']}")
