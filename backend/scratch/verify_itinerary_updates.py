import sys
import os
import json

# Add parent directory to path to import models and ai
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai.itinerary import _parse_itinerary, _parse_cost_to_int

sample_text = """
Destination Info:
Destination: Paris
- Coordinates: [48.8566, 2.3522]
- Description: The city of light and love.
- Estimated Cost: $1200
- Necessities: Comfortable walking shoes.

Destination: London
- Coordinates: 51.5074, -0.1278
- Description: Historic capital with modern flair.
- Estimated Cost: 1000 - 1500 USD
- Necessities: Umbrella.

Day 1:
- Origin: CDG Airport
- Destination: Eiffel Tower
- Image Query: Eiffel Tower at sunset
- Activities:
  - Visit the tower
  - Picnic at Champ de Mars
- Estimated cost: $200

Day 2:
- Origin: Hotel Central
- Destination: Louvre Museum
- Image Query: Louvre Pyramid
- Activities:
  - See the Mona Lisa
  - Walk through Tuileries Garden
- Estimated cost: 150-250

Trip Summary:
- Total estimated cost: $2800
- Budget fit: Yes
"""

def test_cost_parsing():
    print("Testing cost parsing...")
    assert _parse_cost_to_int("$150") == 150
    assert _parse_cost_to_int("100-200 USD") == 150
    assert _parse_cost_to_int("Free") == 0
    assert _parse_cost_to_int("Approx 500") == 500
    print("Cost parsing tests passed!")

def test_itinerary_parsing():
    print("\nTesting itinerary parsing...")
    result = _parse_itinerary(sample_text)
    
    # Check destinations
    print(f"Destinations found: {len(result['destinations'])}")
    for d in result['destinations']:
        print(f"  - {d['name']}: Cost={d['estimated_price']} ({type(d['estimated_price'])})")
        assert isinstance(d['estimated_price'], int)
        
    # Check days
    print(f"Days found: {len(result['days'])}")
    for d in result['days']:
        print(f"  Day {d['day']}: Origin={d['origin']}, Dest={d['destination']}, Cost={d['cost']} ({type(d['cost'])})")
        assert isinstance(d['cost'], int)
        assert d['origin'] != ""
        assert d['destination'] != ""
        assert d['image_query'] != ""
        
    # Check summary
    print(f"Summary: Total={result['summary']['total_cost']} ({type(result['summary']['total_cost'])})")
    assert isinstance(result['summary']['total_cost'], int)

if __name__ == "__main__":
    try:
        test_cost_parsing()
        test_itinerary_parsing()
        print("\nAll tests passed successfully!")
    except Exception as e:
        print(f"\nTests failed: {e}")
        import traceback
        traceback.print_exc()
