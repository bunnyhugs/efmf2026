import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

# Mapping of day index to actual date
day_to_date = {
    1: "2025-07-24",
    2: "2025-07-25",
    3: "2025-07-26",
    4: "2025-07-27"
}

# Mapping of day index to actual date and local file
day_to_date_file = {
    1: ("2025-07-24", "day1.html"),
    2: ("2025-07-25", "day2.html"),
    3: ("2025-07-26", "day3.html"),
    4: ("2025-07-27", "day4.html"),
}

# Read artists.json
with open("artists-step1.json", "r", encoding="utf-8") as f:
    artists_data = json.load(f)

# Helper to find artist slug by name
def get_artist_slug(name):
    name = name.strip().rstrip(" •")
    for artist in artists_data.values():
        if artist["name"].strip() == name:
            return artist["slug"]
    return None

# Convert "1315" -> "13:15:00"
def convert_time(tstr):
    return f"{tstr[:2]}:{tstr[2:]}:00"

output = {}

for day_index, (date_str, filename) in day_to_date_file.items():
    with open(filename, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # url = f"https://calgaryfolkfest.com/folk-fest/schedule?day={day}"
    # response = requests.get(url)
    # soup = BeautifulSoup(response.text, "html.parser")
    # date_str = day_to_date[day]
    
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    pretty_date = date_obj.strftime("%a, %b %d %Y")

    output[date_str] = {
        "date": pretty_date,
        "gate_open_time": "",
        "schedule": {}
    }

    stages = soup.select("div.schedule-row")
    for stage_elem in stages:
        stage = stage_elem.select("p.stage-label")[0].text.strip() if stage_elem else ""
        if stage:
            if (stage[-1] == "e"):
                stage_id = 0
            elif (stage[-1] == "t"):
                stage_id = 7
            else:
                stage_id = int(stage[-1])
        else: ""
        slots = stage_elem.select("div.time-slot[data-id]")
        for slot in slots:

            show_id = slot["data-id"]
            show_name_elem = slot.select_one("div.flex-btwn > p.semi-bold")
            show_type_elem = slot.select_one("p.time-slot-type")
            show_type = show_type_elem.text.strip() if show_type_elem else ""
            show_name = show_name_elem.text.strip() if show_name_elem else ""

            print(f"{show_id} - {show_name} - {show_type}")
            print(f"{stage} - {stage_id}")

            if (show_type == "Session"):
                artist_elem = slot.select("p.p-sm:nth-of-type(1)")
            else:
                artist_elem = []


            start_raw = slot.get("data-start-time", "")
            end_raw = slot.get("data-end-time", "")
            start_time = convert_time(start_raw) if start_raw else ""
            end_time = convert_time(end_raw) if end_raw else ""

            artists = []

            # Parse artists (second p.p-sm)
            slugs = {}
            if len(artist_elem) > 1:
                artists_text = artist_elem[1].get_text(separator="\n").strip()
                for artist_name in artists_text.split(" • "):
                    cleaned_name = artist_name.strip()
                    print(f"{cleaned_name}")
                    artists.append(cleaned_name)
                    slug = get_artist_slug(cleaned_name)
                    if slug:
                        slugs[slug] = {
                            "slug": slug,
                            "name": cleaned_name
                        }
            else:
                artists_text = show_name
                artists.append(artists_text)
                cleaned_name = artists_text.strip().rstrip(" •")
                slug = get_artist_slug(cleaned_name)
                if slug:
                    slugs[slug] = {
                        "slug": slug,
                        "name": cleaned_name
                    }

            # Add to schedule
            output[date_str]["schedule"][show_id] = {
                "showId": show_id,
                "showName": show_name,
                "showDesc": None,
                "type": show_type,
                "startDate": date_str,
                "endDate": date_str,
                "startTime": start_time,
                "endTime": end_time,
                "startDateTime": f"{date_str}T{start_time}" if start_time else "",
                "endDateTime": f"{date_str}T{end_time}" if end_time else "",
                "tags": artists,
                "location": stage,
                "locationId": stage_id,
                "slugs": slugs
            }

# Save to JSON
with open("schedule.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)
