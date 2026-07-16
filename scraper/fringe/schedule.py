# build_schedule.py

import os
import json
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from collections import OrderedDict


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

def format_showdesc(data):
    parts = [
        data.get("description", ""),
        data.get("credits", ""),
        data.get("website", ""),
        data.get("plain_language", ""),
        data.get("show_type", ""),
        data.get("price", ""),
        data.get("run", ""),
        data.get("playtime", ""),
        data.get("venue", ""),
        data.get("site", ""),
        data.get("age", ""),
        data.get("warnings", "").replace('<div class=\"warning-box\">', '').replace('</div>', '')
    ]
    return "".join(f"<p>{p}</p>" for p in parts if p)

def parse_event_file(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def extract_location_id(html):
    soup = BeautifulSoup(html, "html.parser")
    h3s = soup.find_all("h3")
    if len(h3s) >= 2:
        try:
            return int(h3s[1].get_text(strip=True).split(":")[0])
        except:
            return None
    return None

def round_down_to_5min(dt: datetime) -> datetime:
    return dt.replace(minute=(dt.minute // 5) * 5, second=0, microsecond=0)

def build_schedule():
    schedule = {}

    for folder in os.listdir():
        if not os.path.isdir(folder):
            continue

        json_file = os.path.join(folder, f"{folder}.json")
        if not os.path.exists(json_file):
            continue

        try:
            data = parse_event_file(json_file)
            title = data.get("title", "")
            description = data.get("description", "")
            credits = data.get("credits", "")
            website = data.get("website", "")
            plain_language = data.get("plain_language", "")
            show_type = data.get("show_type", "")
            price = data.get("price", "")
            run = data.get("run", "")
            playtime = data.get("playtime", "")
            venue = data.get("venue", "")
            site = data.get("site", "")
            age = data.get("age", "")
            warnings = data.get("warnings", "").replace('<div class=\"warning-box\">', '').replace('</div>', '')
            location_html = data.get("location_html", "")
            event_id = data.get("performances", {}).get("eventId", "").split(":")[1]

            location_id = data.get("locationId", "")
            location = data.get("location", "")

            for date_str, performances in data.get("performances", {}).get("times", {}).items():
                # Ensure "2025-08-07" format
                if date_str not in schedule:
                    dt_obj = datetime.strptime(date_str, "%Y-%m-%d")
                    schedule[date_str] = {
                        "date": dt_obj.strftime("%a, %b %d %Y"),
                        "schedule": {}
                    }

                for p in performances:
                    perf_id = p["id"]
                    start_time = p["performanceTime"]  # HH:MM
                    start_datetime = f"{date_str}T{start_time}:00"

                    # Calculate endTime
                    minutes = extract_minutes(playtime)
                    start_dt = datetime.strptime(f"{date_str} {start_time}", "%Y-%m-%d %H:%M")
                    end_dt = start_dt + timedelta(minutes=minutes)
                    end_time = end_dt.strftime("%H:%M:%S")
                    end_datetime = end_dt.strftime("%Y-%m-%dT%H:%M:%S")
                    start_rounded = round_down_to_5min(start_dt)
                    end_rounded = round_down_to_5min(end_dt)


                    availability = p["availability"]

                    entry = {
                        "showId": perf_id,
                        "showName": title,
                        "showDesc": format_showdesc(data),
                        "type": show_type.split("</span> ")[1],
                        "availability": availability,
                        "startDate": date_str,
                        "endDate": end_dt.strftime("%Y-%m-%d"),
                        "startTime": f"{start_time}:00",
                        "endTime": end_time,
                        "startTimeRounded": start_rounded.strftime("%H:%M:%S"),
                        "endTimeRounded": end_rounded.strftime("%H:%M:%S"),
                        "startDateTime": start_datetime,
                        "endDateTime": end_datetime,
                        "tags": [title],
                        "location": location,
                        "locationId": location_id,
                        "slugs": {
                            event_id: {
                                "slug": event_id,
                                "name": title
                            }
                        }
                    }

                    schedule[date_str]["schedule"][perf_id] = entry

        except Exception as e:
            print(f"Error processing {json_file}: {e}")

    return schedule

if __name__ == "__main__":
    final_schedule = build_schedule()
    sorted_schedule = OrderedDict(sorted(final_schedule.items()))

    with open("schedule.json", "w", encoding="utf-8") as f:
        json.dump(sorted_schedule, f, indent=2, ensure_ascii=False)
    print(f"Saved schedule.json with {len(sorted_schedule)} days of events.")
