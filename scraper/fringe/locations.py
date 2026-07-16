import os
import json
import re
from bs4 import BeautifulSoup
from collections import defaultdict

location_data = {}
max_capacity_map = defaultdict(int)

# Loop through all folders
for folder_name in os.listdir():
    folder_path = os.path.join(folder_name, f"{folder_name}.json")
    if not os.path.isdir(folder_name) or not os.path.isfile(folder_path):
        continue

    with open(folder_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    location_html = data.get("location_html", "")
    soup = BeautifulSoup(location_html, "html.parser")

    h3_tags = soup.find_all("h3")
    if len(h3_tags) < 2:
        continue

    altName = h3_tags[0].get_text(strip=True)
    second_h3 = h3_tags[1].get_text(strip=True)
    match = re.match(r"(\d+):\s*(.+)", second_h3)
    if not match:
        continue

    location_id = match.group(1)
    name_suffix = match.group(2)
    name = f"{location_id}: {name_suffix}"

    # Remove h3 elements for shortDesc
    for h in h3_tags:
        h.extract()
    short_desc = soup.decode_contents().strip()

    # Track max capacity
    performances = data.get("performances", {}).get("times", {})
    for perf_list in performances.values():
        for perf in perf_list:
            availability = perf.get("availability")
            if isinstance(availability, int):
                max_capacity_map[location_id] = max(max_capacity_map[location_id], availability)

    location_data[str(int(location_id))] = {
        "locationId": int(location_id),
        "name": name,
        "altName": altName,
        "shortDesc": short_desc,
        "maxCapacity": max_capacity_map[location_id]
    }

# Write result to file
with open("locations.json", "w", encoding="utf-8") as out_file:
    json.dump(location_data, out_file, indent=2, ensure_ascii=False)
