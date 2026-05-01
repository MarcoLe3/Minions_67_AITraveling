import re

line = "- Coordinates: 37.7749, -122.4194"
coords_str = line.split("Coordinates:")[1].strip().strip("*").strip()

lat = None
lng = None
try:
    parts = [p.strip() for p in coords_str.split(',')]
    if len(parts) == 2:
        lat = float(parts[0])
        lng = float(parts[1])
except Exception as e:
    print(f"Error: {e}")

print(f"Lat: {lat}, Lng: {lng}")
