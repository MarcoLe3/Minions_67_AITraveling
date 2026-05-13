import os
import re
import requests
from typing import Optional

def _clean_image_query(name: str, destination: str = "") -> str:
    _STRIP_PREFIXES = re.compile(
        r"^(visit|explore|see|take a|take the|enjoy|discover|walk through|walk to|"
        r"stroll through|head to|go to|try|attend|experience|a |the )\s*",
        re.IGNORECASE,
    )
    name = _STRIP_PREFIXES.sub("", name).strip()
    if not destination:
        return name
    return f"{name} {destination}"

def _get_wiki_image(name: str, destination: str = "") -> str:
    query = _clean_image_query(name, destination)
    print(f"DEBUG: Wikipedia query for '{name}' + '{destination}' -> '{query}'")
    try:
        search_res = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": 1,
            },
            timeout=5
        ).json()
        
        search_results = search_res.get("query", {}).get("search", [])
        if not search_results:
            print("DEBUG: No search results found")
            return ""
        
        title = search_results[0]["title"]
        print(f"DEBUG: Found title '{title}'")
        
        img_res = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": title,
                "prop": "pageimages",
                "format": "json",
                "pithumbsize": 800,
            },
            timeout=5
        ).json()
        
        pages = img_res.get("query", {}).get("pages", {})
        for page in pages.values():
            if "thumbnail" in page:
                url = page["thumbnail"]["source"]
                print(f"DEBUG: Found image URL: {url}")
                return url
    except Exception as e:
        print(f"DEBUG: Exception: {e}")
    
    print("DEBUG: No image found")
    return ""

print("Test 1: Statue of Liberty")
_get_wiki_image("Statue of Liberty", "New York City")

print("\nTest 2: Central Park")
_get_wiki_image("Central Park", "New York City")

print("\nTest 3: Lombardi's Pizza")
_get_wiki_image("Lombardi's Pizza", "New York City")
