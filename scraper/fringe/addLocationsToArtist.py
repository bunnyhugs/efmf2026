# extract_locations.py

import os
import json
from bs4 import BeautifulSoup

def extract_location_data(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    site = data.get("site", "")
    location_id = site.split(": ")[0].split("/span> ")[1]
    name = site.split(": ")[1].strip()

    data["locationId"] = int(location_id);
    data["location"] = location_id + ": " + name;

    return data

def collect_locations():
    locations = {}

    for folder in os.listdir():
        if not os.path.isdir(folder):
            continue
        json_file = os.path.join(folder, f"{folder}.json")
        if not os.path.exists(json_file):
            continue

        try:
            loc_data = extract_location_data(json_file)
            with open(json_file, "w", encoding="utf-8") as f:
                json.dump(loc_data, f, indent=2, ensure_ascii=False)
            print(f"Saved {json_file}")


        except Exception as e:
            print(f"Error processing {json_file}: {e}")



if __name__ == "__main__":
    collect_locations()
