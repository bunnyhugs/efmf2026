# build_artists.py

import os
import json
from pathlib import Path
from datetime import datetime, timedelta
import re
from bs4 import BeautifulSoup
import validators

import re

def extract_minutes(playtime_str):
    if not playtime_str:
        return 60  # Default fallback

    try:
        # Normalize dashes and spaces
        playtime_str = playtime_str.replace('\u2013', '-')  # en-dash
        playtime_str = playtime_str.replace('\u2014', '-')  # em-dash
        playtime_str = playtime_str.replace('\xa0', ' ')    # non-breaking space

        # Replace "hour" or "hr" with 60 for parsing
        playtime_str = re.sub(r'\b(\d+)\s*(hour|hr|hrs)\b', lambda m: str(int(m.group(1)) * 60), playtime_str, flags=re.IGNORECASE)

        # Find all numbers
        numbers = [int(n) for n in re.findall(r'\d+', playtime_str)]
        if numbers:
            return max(numbers)
    except Exception as e:
        print(f"Failed to parse playtime '{playtime_str}': {e}")

    return 60

def extract_runtime(playtime_str):
    matches = re.findall(r'\d.*\d', playtime_str)
    if matches:
        return f"{matches[0].replace(' ','').replace('minutes', '')}"
    
def extract_price(price_str):
    matches = re.findall(r'\$\d+', price_str)
    if matches:
        return f"{matches[0]}"
    

def extract_website_parts(website):
    url = None
    insta = None
    facebook = None
    
    if website:
        if ('instagram' in website):
            matches = re.findall(r"instagram.com/[^\s\"']+", website)
            if matches:
                insta = f"https://{matches[0]}"
        if ('facebook' in website):
            matches = re.findall(r"https?://facebook.com/[^\s\"']+", website)
            if matches:
                facebook = f"{matches[0]}"
            

        if ('@' in website):
            matches = re.findall(r'@([\w_.]+)', website)
            if matches:
                insta = f"https://instagram.com/{matches[0]}"
                
        # Extract first valid URL
        matches = re.findall(r"https?://[^\s\"']+", website)
        if matches:
            url = matches[0]
        else:
            # fallback if no scheme
            matches = re.findall(r"\b(?:www\.)?[\w.-]+\.[a-z]{2,}\b", website)
            if matches:
                url = f"https://{matches[0]}"

    if url:
        matches = re.findall(r"instagram.com/[^\s\"']+", website)
        if matches:
            url = None
        elif not validators.url(url):
            url = None
    if insta:
        if not validators.url(insta):
            insta = None
    if facebook:
        if not validators.url(facebook):
            facebook = None
        
    return url, insta, facebook

def format_showdesc(data):
    parts = [
        '<div class="tags">' + data.get("price", ""),
        data.get("playtime", ""),
        data.get("site", "") + "</div>",
        '<div class="tags">' + data.get("warnings", "").replace('<div class=\"warning-box\">', '').replace('</div>', '') + "</div>",
        "<p><strong>Summary:</strong> " + data.get("plain_language", "") + "</p><hr/>",
        "<p>" + data.get("description", "")+ "</p>",
        data.get("credits", ""),
        data.get("website", "") + "<br/>",
        '<div class="tags">' + data.get("run", ""),
        data.get("venue", ""),
        data.get("age", "") + '</div>'
    ]
    return "".join(f"{p}" for p in parts if p)

def build_artists():
    artists = {}

    for folder in os.listdir():
        if not os.path.isdir(folder):
            continue

        json_path = Path(folder) / f"{folder}.json"
        if not json_path.exists():
            continue

        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            artist_id = folder
            title = data.get("title", "")
            show_type = data.get("show_type", "")
            playtime = data.get("playtime", "")
            price = data.get("price", "")
            website_raw = data.get("website", "")
            location = data.get("location", "")
            location_id = data.get("locationId", None)
            image = str(Path(data.get("image", "")).as_posix())
            bio = format_showdesc(data)

            url, insta, facebook = extract_website_parts(website_raw)

            # Build shows list
            shows = []
            performances = data.get("performances", {})
            times = performances.get("times", {})
            for date_str, perf_list in times.items():
                for perf in perf_list:
                    start_time = perf["performanceTime"]  # HH:MM
                    show_id = perf["id"]
                    start_dt = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
                    minutes = extract_minutes(playtime)
                    end_dt = start_dt + timedelta(minutes=minutes)

                    shows.append({
                        "startDateTime": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                        "endDateTime": end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                        "startDate": date_str,
                        "endDate": end_dt.strftime("%Y-%m-%d"),
                        "startTime": f"{start_time}:00",
                        "endTime": end_dt.strftime("%H:%M:%S"),
                        "location": location,
                        "locationId": location_id,
                        "type": show_type,
                        "showId": show_id,
                        "showName": title
                    })

            artists[folder] = {
                "id": folder,
                "slug": folder,
                "geo": show_type,
                "name": title,
                "image": image,
                "bio": bio,
                "men": None,
                "notMen": None,
                "locationId": location_id,
                "runtime": extract_runtime(playtime),
                "price": extract_price(price),
                "socials": {
                    "website": url,
                    "instagram": insta,
                    "facebook": facebook,
                    "full": website_raw,
                    "fest": f"https://tickets.fringetheatre.ca/event/601:{folder}"
                },
                "shows": shows
            }

        except Exception as e:
            print(f"Error processing {folder}: {e}")

    return artists

if __name__ == "__main__":
    artists_data = build_artists()
    with open("artists.json", "w", encoding="utf-8") as f:
        json.dump(artists_data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(artists_data)} artists to artists.json")
