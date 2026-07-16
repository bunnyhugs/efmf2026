# scrape_event_links.py

import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://tickets.fringetheatre.ca"
LISTING_URL = f"{BASE_URL}/events/"
OUTPUT_FILE = "event_links.json"

def get_event_links():
    response = requests.get(LISTING_URL)
    soup = BeautifulSoup(response.text, "html.parser")
    links = []

    for a in soup.select("div.card-footer > a.btn"):
        href = a.get("href")
        if href and ':' in href:
            full_url = BASE_URL + href
            links.append(full_url)

    # Remove duplicates
    unique_links = list(sorted(set(links)))
    return unique_links

if __name__ == "__main__":
    event_links = get_event_links()
    with open(OUTPUT_FILE, "w") as f:
        json.dump(event_links, f, indent=2)
    print(f"Saved {len(event_links)} event links to {OUTPUT_FILE}")
