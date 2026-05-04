import re
import json

def parse_destinations(text):
    structured_destinations = []
    # Try finding Destination Info section
    dest_section_match = re.search(r"Destination Info:(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    if not dest_section_match:
        # Try finding destination blocks without the header
        dest_section_match = re.search(r"(?i)\*?\*?Destination:\*?\*?\s*(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    
    if dest_section_match:
        dest_text = dest_section_match.group(0)
        if "Destination Info:" not in dest_text:
            # Look from start of text to Day 1 to ensure we don't miss the first one
            end_pos = text.lower().find("day 1:")
            if end_pos == -1:
                end_pos = len(text)
            dest_text = text[:end_pos]
            dest_text = re.sub(r"(?i)^.*?(?=\*?\*?Destination:)", "", dest_text, flags=re.DOTALL)
            
        dest_blocks = re.split(r"(?i)\*?\*?Destination:\*?\*?\s*", dest_text)
        for block in dest_blocks:
            if not block.strip() or "Info:" in block:
                continue
            lines = block.strip().split("\n")
            name = lines[0].strip().strip("*").strip()
            
            description = ""
            cost = ""
            necessities = ""
            lat = None
            lng = None
            
            desc_match = re.search(r"(?i)Description:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if desc_match:
                description = desc_match.group(1).strip().strip("*").strip()
                
            cost_match = re.search(r"(?i)Estimated Cost:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if cost_match:
                cost = cost_match.group(1).strip().strip("*").strip()
                
            nec_match = re.search(r"(?i)Necessities:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if nec_match:
                necessities = nec_match.group(1).strip().strip("*").strip()
                
            coord_match = re.search(r"(?i)Coordinates:\s*\*?\*?\s*(.*?)(?=\n-|\n\*|$)", block, re.DOTALL)
            if coord_match:
                coords_str = coord_match.group(1).strip().strip("*").strip()
                nums = re.findall(r"-?\d+(?:\.\d+)?", coords_str)
                if len(nums) >= 2:
                    try:
                        lat = float(nums[0])
                        lng = float(nums[1])
                    except Exception:
                        pass
                        
            structured_destinations.append({
                "name": name,
                "description": description,
                "estimated_price": cost,
                "necessities": necessities,
                "lat": lat,
                "lng": lng
            })
    return structured_destinations

test_cases = {
    "standard": """
Destination Info:
Destination: Paris
- Coordinates: [48.8566, 2.3522]
- Description: The city of light.
- Estimated Cost: $1200
- Necessities: Comfortable walking shoes.

Day 1:
- Activity: Visit Eiffel Tower
""",
    "messy_markdown": """
### Destination Info:
**Destination:** *London*
*   **Coordinates:** (51.5074, -0.1278)
*   **Description:** A historic capital.
*   **Estimated Cost:** £1000 ($1300)
*   **Necessities:** Umbrella.

Day 1:
...
""",
    "no_header": """
Here are your destinations:

Destination: New York
- Coordinates: 40.7128° N, 74.0060° W
- Description: The Big Apple.
- Estimated Cost: $1500
- Necessities: Metro card.

Day 1:
""",
    "brackets_and_garbage": """
Destination: Rome
- Coordinates: Latitude: 41.9028, Longitude: 12.4964
- Description: The Eternal City.
- Estimated Cost: ~2000 USD
- Necessities: Sunscreen.

Day 1:
"""
}

if __name__ == "__main__":
    results = {}
    for name, text in test_cases.items():
        results[name] = parse_destinations(text)
    
    print(json.dumps(results, indent=2))
