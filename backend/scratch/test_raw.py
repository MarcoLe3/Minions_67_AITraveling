import json
from models.itinerary import Location
from ai.itinerary import generate_itinerary_service, _call_hf_inference

# Create a mock path
loc1 = Location(name="San Francisco")
loc2 = Location(name="Tokyo")
paths = [[loc1, loc2]]

dest_str = "Tokyo, San Francisco"
path_descriptions = "from San Francisco to Tokyo"
days = 5
budget = 1500

prompt = (
    "You are an expert AI Travel Assistant. Create a highly detailed and structured "
    f"travel itinerary for a trip {path_descriptions} "
    f"for a total duration of {days} days, with a total budget of ${budget}.\n\n"
    "First, provide a 'Destination Info' section for each unique destination: " + dest_str + ".\n"
    "Format for each destination:\n"
    "Destination: [Name]\n"
    "- Coordinates: [Latitude, Longitude]\n"
    "- Description: [2-3 sentence overview]\n"
    "- Estimated Cost: [Estimated price for travel and stay in USD]\n"
    "- Necessities: [Visas, weather, local tips]\n\n"
    "Please follow this exact format for each day:\n"
    "Day [Number]:\n"
    "- Activities: [List detailed activities]\n"
    "- Estimated cost: [Specific amount for the day, e.g. $150]\n\n"
    "Finally, provide a 'Trip Summary' section at the end:\n"
    "Trip Summary:\n"
    "- Total estimated cost: [Sum of all daily costs, e.g. $2500]\n"
    f"- Budget fit: [Yes/No, based on whether the total is within ${budget}]\n\n"
    "Do not use markdown bolding in headers like 'Destination:' or 'Day [Number]:'. Ensure the advice is practical and fits the specified budget."
)

raw_text = _call_hf_inference(prompt)
print("=== RAW TEXT ===")
print(raw_text)
