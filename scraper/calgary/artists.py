import requests
from bs4 import BeautifulSoup
import json
import os
import time
from urllib.parse import urlparse

BASE_URL = "https://calgaryfolkfest.com/folk-fest/"
LINEUP_URL = f"{BASE_URL}lineup"
HEADERS = {"User-Agent": "Mozilla/5.0"}
IMG_DIR = "img"


os.makedirs(IMG_DIR, exist_ok=True)

def get_artist_links():
    response = requests.get(LINEUP_URL, headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')
    return [BASE_URL + a['href'] for a in soup.select('a[aria-label="link to artist single page"]')]

def extract_social_link(soup, label):
    social = soup.select_one(f'a[aria-label="link out to {label}"]')
    return social['href'] if social else None

def download_image(url, slug):
    if not url:
        return None, None
    try:
        parsed_url = urlparse(url)
        ext = os.path.splitext(parsed_url.path)[1] or ".jpg"
        filename = f"{slug}{ext}"
        filepath = os.path.join(IMG_DIR, filename)

        if not os.path.exists(filepath):
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()

            with open(filepath, "wb") as f:
                f.write(response.content)

        return filename, f"/img/{filename}"
    except Exception as e:
        print(f"Failed to download image for {slug}: {e}")
        return None, None

def scrape_artist_page(url, artistId):
    print(f"Scraping: {url}")
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, 'html.parser')

    slug = url.split("/artists/")[-1].strip("/").lower()

    image_tag = soup.select_one("div.artist-page-image img")
    image_url = image_tag['src'] if image_tag else None
    image_filename, local_image_path = download_image(image_url, slug)

    data = {
        "artistId": artistId,
        "url": url.replace("/folk-fest/..", ""),
        "slug": slug,
        "men": 0,
        "notMen": 0,
        "origImage": image_url,
        "image": local_image_path,
        "name": soup.select_one("div.artist-page-headline h2").get_text(strip=True) if soup.select_one("div.artist-page-headline h2") else None,
        "geo": soup.select_one("div.artist-page-headline p").get_text(strip=True) if soup.select_one("div.artist-page-headline p") else None,
        "socials": {
            "fest": url.replace("/folk-fest/..", ""),
            "website": extract_social_link(soup, "website"),
            "facebook": extract_social_link(soup, "facebook"),
            "instagram": extract_social_link(soup, "instagram"),
            "spotify": extract_social_link(soup, "spotify"),
            "itunes": extract_social_link(soup, "itunes"),
            "twitter": extract_social_link(soup, "twitter"),
            "bandcamp": extract_social_link(soup, "bandcamp"),
            "youtube": extract_social_link(soup, "youtube")
        },
        "bio": str(soup.select_one("div.artist-container div.wysiwyg")) if soup.select_one("div.artist-container div.wysiwyg") else None
    }

    return data

def main():
    artist_links = get_artist_links()
    all_artists = {}
    artistId = 0

    for link in artist_links:
        try:
            artist_data = scrape_artist_page(link, artistId)
            all_artists[artist_data["slug"]] = artist_data
            artistId = artistId + 1
            time.sleep(0.1)
        except Exception as e:
            print(f"Error scraping {link}: {e}")

    with open("artists-step1.json", "w", encoding="utf-8") as f:
        json.dump(all_artists, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()

