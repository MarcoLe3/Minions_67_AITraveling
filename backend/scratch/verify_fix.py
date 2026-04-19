import os
import sys
from dotenv import load_dotenv

# Add the backend directory to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai.itinerary import generate_itinerary_service

class MockLocation:
    def __init__(self, name, lat, lng):
        self.name = name
        self.lat = lat
        self.lng = lng

def test_itinerary():
    print("Starting verification test...")
    try:
        # Using real inputs for a small test
        result = generate_itinerary_service(
            paths=[[MockLocation("San Francisco", 37.77, -122.41), MockLocation("Las Vegas", 36.16, -115.13)]], 
            budget=500, 
            days=1
        )
        print("\n--- Test Successful! ---")
        print(f"Status: Success")
        print(f"Model used: meta-llama/Llama-3.1-8B-Instruct")
        print(f"Sample Day 1 Activity: {result['days'][0]['activities'][0]}")
        print(f"Daily Cost: {result['days'][0]['cost']}")
        print(f"Summary: {result['summary']['total_cost']}")
        print("------------------------\n")
    except Exception as e:
        print(f"\n--- Test Failed! ---")
        print(f"Error: {e}")
        print("--------------------\n")

if __name__ == "__main__":
    test_itinerary()
