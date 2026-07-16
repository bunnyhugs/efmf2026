import json
import unicodedata
from difflib import SequenceMatcher

# Load artists-step1.json
with open('artists-step1.json', 'r') as f:
    artists_step1 = json.load(f)

# Load schedule.json
with open('schedule-step1.json', 'r') as f:
    schedule = json.load(f)

# Function to normalize strings for better matching
def normalize_string(s):
    return unicodedata.normalize('NFKD', s.casefold())

# Create a dictionary to map normalized artist names to their slugs and names
artist_name_to_info = {}
for artist_id, artist_data in artists_step1.items():
    artist_name = artist_data['name']
    artist_slug = artist_data['slug']
    artist_name_normalized = normalize_string(artist_name)
    artist_name_to_info[artist_name_normalized] = {
        'slug': artist_slug,
        'name': artist_name
    }

# Function to calculate similarity score based on character matching
def calculate_similarity(tag, artist_name):
    matcher = SequenceMatcher(None, tag, artist_name)
    match = matcher.find_longest_match(0, len(tag), 0, len(artist_name))
    similarity = match.size / (len(tag) + len(artist_name) - match.size)
    return similarity

# Function to find the best matching artist for a given set of tags
def find_best_artist(tags):
    best_match = None
    best_score = -1
    threshold = 0.33  # Adjust this threshold based on your confidence level
    
    for tag in tags:
        normalized_tag = normalize_string(tag)
        
        for artist_name, info in artist_name_to_info.items():
            normalized_artist_name = artist_name
            
            # Calculate similarity score based on character matching
            similarity_score = calculate_similarity(normalized_tag, normalized_artist_name)
            
            if similarity_score > best_score:
                best_score = similarity_score
                best_match = info
    
    # Output a message if the best score is not very confident
    if best_score < threshold:
        print(f"{tags} matched with")
        if best_match:
            print(f"{best_match['name']} ({best_score})")
    
    return best_match

# Update schedule with the new slugs object
for date in schedule.values():
    for show in date['schedule'].values():
        tags = show['tags']
        new_slugs = {}
        
        # If showName is "Nikamowin", add all artists with "Nikamowin" in their name to slugs
        if show['showName'] == "Nikamowin":
            for artist_name, info in artist_name_to_info.items():
                print(artist_name)
                if "nikamowin" in artist_name:
                    new_slugs[info['slug']] = {
                        'slug': info['slug'],
                        'name': info['name']
                    }
        
        else:
            for tag in tags:
                artist_info = find_best_artist([tag])
                if artist_info:
                    new_slugs[artist_info['slug']] = {
                        'slug': artist_info['slug'],
                        'name': artist_info['name']
                    }
        
        show['slugs'] = new_slugs

# Save the updated schedule back to schedule_updated.json
with open('schedule.json', 'w') as f:
    json.dump(schedule, f, indent=4)

# Choose a sample part of the schedule to print
sample_date = next(iter(schedule.values()))
sample_show = next(iter(sample_date['schedule'].values()))

# Print the sample part of the schedule for verification
print(json.dumps(sample_show, indent=4))
