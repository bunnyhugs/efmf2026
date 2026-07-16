import json
from datetime import datetime, timedelta
import os
import requests

def round_time_down_to_5(time_str):
    dt = datetime.strptime(time_str, "%H:%M:%S")
    rounded_minutes = (dt.minute // 5) * 5
    dt = dt.replace(minute=rounded_minutes, second=0)
    return dt.strftime("%H:%M:%S")

# Load shows.json
with open('shows.json', 'r') as f:
    shows = json.load(f)

# Load tags.json
with open('tags.json', 'r') as f:
    tags = json.load(f)

# Function to format the date
def format_date(date_str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.strftime("%a, %b %d %Y")

# Create the schedule dictionary
schedule = {}

# Tags to filter out
tags_to_filter = ["Session", "Concert", "Artist", "Main Stage"]
tags_to_filter_prefix = "Stage "

# Create 'artists' directory if it does not exist
if not os.path.exists('shows'):
    os.makedirs('shows')

# Function to download a file if it doesn't exist
def download_file(url, path):
    if not os.path.exists(path):
        response = requests.get(url)
        with open(path, 'wb') as f:
            f.write(response.content)


# Loop through each show
for show_id, show_details in shows.items():
    date_start = show_details.get('date_start')
    date_end = show_details.get('date_end')
    time_start = (show_details.get('time_start', ''))
    time_end = (show_details.get('time_end', ''))
    rounded_time_start = round_time_down_to_5(show_details.get('time_start', ''))
    rounded_time_end = round_time_down_to_5(show_details.get('time_end', ''))
    
    formatted_date_start = format_date(date_start)
    formatted_date_end = format_date(date_end) if date_end else None
    
    # Determine type based on tags
    if 350 in show_details.get('tags', []):
        show_type = "Concert"
    elif 349 in show_details.get('tags', []):
        show_type = "Session"
    else:
        # Check if "Main Stage" tag is present
        main_stage_tag = any(tags['shows'][str(tag_id)]['title'] == "Main Stage" for tag_id in show_details.get('tags', []))
        if main_stage_tag:
            show_type = "Concert"
        else:
            show_type = "Other"  # Default value if neither tag is found
    
    # Filter out unwanted tags
    filtered_tags = [tags['shows'][str(tag_id)]['title'] for tag_id in show_details.get('tags', [])
                     if tags['shows'][str(tag_id)]['title'] not in tags_to_filter
                     and not tags['shows'][str(tag_id)]['title'].startswith(tags_to_filter_prefix)]

    # Populate the schedule for date_start
    if date_start not in schedule:
        schedule[date_start] = {
            "date": formatted_date_start,
            "gate_open_time": "",
            "schedule": {}
        }
    
    
    show_path = f"shows/{show_id}.json"
    download_file(f"https://goeventweb-static.greencopper.com/db769c897a254756b594aafdce55deed/edmontonfolkfestivalwebwidget-2025/data/eng/events/{show_details['object']['_id']}.json", show_path)
    # Load shows.json
    with open(show_path, 'r') as f:
        show_json = json.load(f)


    
    schedule[date_start]["schedule"][show_id] = {
        "showId": show_id,
        "showName": show_details['object']['title'],
        "showDesc": show_json['description'],
        "type": show_type,
        "startDate": date_start,
        "endDate": date_end,
        "startTime": time_start,
        "endTime": time_end,
        "startTimeRounded": rounded_time_start,
        "endTimeRounded": rounded_time_end,
        "startDateTime": f"{date_start}T{time_start}",
        "endDateTime": f"{date_end}T{time_end}" if date_end else None,
        "tags": filtered_tags,
        "location": show_details["venue"]["title"],
        "locationId": show_details["venue"]["_id"],
        "slugs": {
            show_details["slug"]: {
                "slug": show_details["slug"],
                "name": show_details["object"]["title"]
            }
        }
    }

    # Populate the schedule for date_end if different from date_start
    if date_end and date_end != date_start:
        if date_end not in schedule:
            schedule[date_end] = {
                "date": formatted_date_end,
                "gate_open_time": "",
                "schedule": {}
            }

        schedule[date_end]["schedule"][show_id] = {
            "showId": show_id,
            "showName": show_details['object']['title'],
            "type": show_type,
            "startDate": date_start,
            "endDate": date_end,
            "startTime": time_start,
            "endTime": time_end,
            "startDateTime": f"{date_start}T{time_start}",
            "endDateTime": f"{date_end}T{time_end}",
            "tags": filtered_tags,
            "location": show_details["venue"]["title"],
            "locationId": show_details["venue"]["_id"],
            "slugs": {
                show_details["slug"]: {
                    "slug": show_details["slug"],
                    "name": show_details["object"]["title"]
                }
            }
        }

# Print the resulting schedule
print(json.dumps(schedule, indent=4))

# Optionally, you can save the schedule to a file
with open('schedule-step1.json', 'w') as f:
    json.dump(schedule, f, indent=4)
