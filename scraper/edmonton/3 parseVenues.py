import json

# Load venues.json
with open('venues.json', 'r', encoding='utf-8') as venues_file:
    venues_data = json.load(venues_file)

# Initialize an empty dictionary for locations
locations = {}

# Iterate through each venue
for venue_id, venue_info in venues_data.items():
    location_id = venue_info['_id']
    name = venue_info['title']
    
    # Create the location object
    location_obj = {
        "locationId": location_id,
        "name": name,
        "altName": "",
        "shortDesc": ""
    }
    
    # Add to the locations dictionary using _id as key
    locations[location_id] = location_obj

# Write locations.json with 4-space indentation
with open('locations.json', 'w', encoding='utf-8') as locations_file:
    json.dump(locations, locations_file, ensure_ascii=False, indent=4)
