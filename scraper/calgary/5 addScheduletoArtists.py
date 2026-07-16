import json

# Load artists data
with open('artists-step1.json', 'r', encoding="utf-8") as artists_file:
    artists_data = json.load(artists_file)

# Load final schedule data
with open('schedule.json', 'r', encoding="utf-8") as schedule_file:
    schedule_data = json.load(schedule_file)

# Iterate through each artist
for artist_slug, artist_info in artists_data.items():
    artist_shows = []
    
    # Iterate through schedule to find matching shows
    for schedule_date, schedule_info in schedule_data.items():
        if "schedule" in schedule_info:
            for showId, show_details in schedule_info["schedule"].items():

                slugs = show_details["slugs"]
                if artist_slug in slugs:
                    # Create show object
                    show_object = {
                        "startDateTime": show_details["startDateTime"],
                        "endDateTime": show_details["endDateTime"],
                        "startDate": show_details["startDate"],
                        "endDate": show_details["endDate"],
                        "startTime": show_details["startTime"],
                        "endTime": show_details["endTime"],
                        "location": show_details["location"],
                        "type": show_details["type"],
                        "showId": show_details["showId"],
                        "showName": show_details["showName"],
                        "locationId": show_details["locationId"]
                    }
                    artist_shows.append(show_object)
    
    # Add shows array to artist info
    artist_info["shows"] = artist_shows

# Save updated artists data to artists-merged.json
with open('artists.json', 'w', encoding="utf-8") as merged_file:
    json.dump(artists_data, merged_file, indent=2, ensure_ascii=False)
