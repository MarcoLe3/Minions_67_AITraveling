import re
import json

text = """
Here is your itinerary!

Destination Info:
**Destination:** San Francisco
- **Coordinates:** [37.7749, -122.4194]
- **Description:** A beautiful city by the bay.
- **Estimated Cost:** $1000
- **Necessities:** Light jacket.

**Destination:** Tokyo
- Coordinates: 35.6895, 139.6917
- Description: Bustling metropolis.
- Estimated Cost: $800 - $1000
- Necessities: Visa.

Day 1:
- Activities: Blah blah
- Estimated cost: $150

Trip Summary:
- Total estimated cost: $2000
- Budget fit: Yes
"""

def test_parse(text):
    structured_destinations = []
    dest_section_match = re.search(r"Destination Info:(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    if not dest_section_match:
        dest_section_match = re.search(r"(?i)\*?\*?Destination:\*?\*?\s*(.*?)(?=Day\s*1:|$)", text, re.IGNORECASE | re.DOTALL)
    
    if dest_section_match:
        # It's better to capture the whole section including the first "Destination:" if we use the fallback
        dest_text = dest_section_match.group(0)
        if "Destination Info:" not in dest_text:
            # If we matched the fallback, it might just start with "Destination:", let's prepend to be safe
            dest_text = text[:dest_section_match.end()] # Actually, just search from start of string to Day 1
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
            
            # Extract fields using regex on the block to handle markdown robustly
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
                # Find all floating point numbers
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
                "lng": lng,
                "image_url": ""
            })
    return structured_destinations

print(json.dumps(test_parse(text), indent=2))
