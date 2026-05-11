import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from ai.itinerary import generate_itinerary_service
from models.itinerary import Location
import json

def test_e2e():
    # Mock paths: Paris to London
    p1 = Location(name="Paris", lat=48.8566, lng=2.3522)
    p2 = Location(name="London", lat=51.5074, lng=-0.1278)
    paths = [[p1, p2]]
    
    budget = 1500
    days = 2
    
    print(f"Generating itinerary for {days} days with budget {budget}...")
    try:
        result = generate_itinerary_service(paths, budget, days)
        print("Generation successful!")
        print(json.dumps(result, indent=2))
        
        assert "days" in result
        assert "destinations" in result
        assert "summary" in result
        assert len(result["days"]) > 0
        print("E2E test passed!")
    except Exception as e:
        print(f"E2E test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_e2e()
