import json
import os
import requests

# Run 1, 2, 3, 4, 5
# Copy locations.json, artists.json, schedule.json to root

def downloadFile(url: str, output_path: str) -> str:
    if os.path.exists(output_path):
        return f"Skipped: '{output_path}' already exists."
    try:
        with requests.get(url, stream=True) as response:
            response.raise_for_status()
            output_dir = os.path.dirname(output_path)
            if output_dir:
              os.makedirs(output_dir, exist_ok=True)
            with open(output_path, "wb") as file:
              for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                   file.write(chunk)

        return f"Success: Saved to {output_path}"

    except requests.exceptions.RequestException as e:
        return f"Down1oad failed ： {e}"

def downloadJsonFile(url: str, output_path: str) -> str:
    return downloadFile("https://goeventweb-static.greencopper.com/db769c897a254756b594aafdce55deed/edmontonfolkfestivalwebwidget-2025/data/eng/" + url + ".json", output_path)

downloadJsonFile("artists", "artistsOrig.json")
downloadJsonFile("tags", "tags.json")
downloadJsonFile("shows", "shows.json")
downloadJsonFile("events", "events.json")
downloadJsonFile("venues", "venues.json")
downloadJsonFile("texts", "texts.json")

 
# Load artists.json
with open('artistsOrig.json', 'r') as f:
    artists = json.load(f)

# Load tags.json
with open('tags.json', 'r') as f:
    tags = json.load(f)

# Create a dictionary for artist tags
artist_tags = {str(tag['_id']): tag['title'] for tag in tags['artists'].values()}

# Create artists-step1.json data
artists_step1 = {}
for artist in artists.values():
    slug = artist['slug']
    _id = artist['_id']
    photo_suffix = artist['photo_suffix']
    artists_step1[slug] = {
        "id": _id,
        "origImage": f"https://goevent-images.greencopper.com/edmontonfolkfestivalwebwidget-2025/523c1712/web/artist_{_id}_{photo_suffix}.jpg",
        "slug": slug,
        "geo": artist['subtitle'],
        "name": artist['title'],
        "image": f"./artists/{slug}.jpg"
    }
    # Add tag titles
    for tag_id in artist['tags']:
        tag_title = artist_tags.get(str(tag_id))
        if tag_title:
            artists_step1[slug][tag_title] = 1

# Save artists-step1.json
with open('artists-step1.json', 'w') as f:
    json.dump(artists_step1, f, indent=4)

# Create 'artists' directory if it does not exist
if not os.path.exists('artists'):
    os.makedirs('artists')

# Function to download a file if it doesn't exist
def download_file(url, path):
    if not os.path.exists(path):
        response = requests.get(url)
        with open(path, 'wb') as f:
            f.write(response.content)

# Download images and JSON files
for artist in artists_step1.values():
    # Download image
    image_url = artist['origImage']
    image_path = f"artists/{artist['slug']}.jpg"
    download_file(image_url, image_path)
    
    # Download JSON file
    json_url = f"https://goeventweb-static.greencopper.com/db769c897a254756b594aafdce55deed/edmontonfolkfestivalwebwidget-2025/data/eng/artists/{artist['id']}.json"
    json_path = f"artists/{artist['slug']}.json"
    download_file(json_url, json_path)

# Process each downloaded JSON file
for filename in os.listdir('artists'):
    if filename.endswith('.json'):
        filepath = os.path.join('artists', filename)
        with open(filepath, 'r') as f:
            artist_data = json.load(f)
            slug = artist_data['slug']
            
            # Add 'bio' key
            artists_step1[slug]['bio'] = artist_data['description']

            artists_step1[slug]['men'] = artist_data.get('men', None)
            artists_step1[slug]['notMen'] = artist_data.get('notMen', None)
            
            # Add 'socials' key
            socials = {}
            for i in range(1, 8):
                link_key = f'link{i}'
                if link_key in artist_data and artist_data[link_key]:
                    key, value = artist_data[link_key].split('|', 1)
                    if key.lower() == 'spotify':
                        value = value.replace('spotify:artist:', 'https://open.spotify.com/artist/')
                    socials[key.lower()] = value
            socials['fest'] = f"https://edmontonfolkfest.org/festival-info/performers-2/#/artist/{artist_data['slug']}"
            artists_step1[slug]['socials'] = socials

# Save the updated artists-step1.json
with open('artists-step1.json', 'w') as f:
    json.dump(artists_step1, f, indent=4)

print("Processing complete.")
