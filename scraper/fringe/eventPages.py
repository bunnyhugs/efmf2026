# scrape_event_details.py

import requests
from bs4 import BeautifulSoup

import os
import json
from urllib.parse import urlparse
from pathlib import Path
import html
import re

INPUT_FILE = "event_links.json"
BASE_URL = "https://tickets.fringetheatre.ca"

def normalize_link(link):
    if len(link) == 0:
        return link
    if link.startswith("@"):
        return f"https://www.instagram.com/{link[1:]}"
    elif not link.startswith("http"):
        return f"https://{link}"
    return link

def convert_date(date_str):
    # from DD/MM/YYYY to YYYY-MM-DD
    parts = date_str.split("/")
    return f"{parts[2]}-{parts[1]}-{parts[0]}"

def clean(element):
    if not element:
        return ""
    return re.sub(r'\s+', ' ', element.decode_contents()).strip()

def clean_li(li):
    if not li:
        return ""
    # Remove span tags
    # for span in li.find_all("span"):
    #    span.extract()
    str = clean(li).replace("https://tickets.fringetheatre.ca/wp-content/themes/red61", "")
    return str

def scrape_event(url):
    short_id = url.split(":")[-1]
    folder = Path(short_id)
    folder.mkdir(exist_ok=True)

    json_path = folder / f"{short_id}.json"
    if json_path.exists():
        print(f"[SKIP] Metadata for {short_id} already exists.")
        return

    print(f"[REQ]  Accessing {short_id}")
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")

    # Title
    title = soup.select_one("div.title h2").decode_contents()
    print(f"###### {title}")
 
    # Description, credits, website, plain language description
    paragraphs = soup.select("div.title p")
    description = clean(paragraphs[1]) if len(paragraphs) > 1 else ""
    # print(f"{description}")
    credits = clean(paragraphs[2]) if len(paragraphs) > 2 else ""
    noWebsite = 0
    if ("Website/Socials" in clean(paragraphs[3])):
        noWebsite = 0
    else:
        credits += clean(paragraphs[3]) if len(paragraphs) > 3 else ""
        noWebsite += -1
        
    # print(f"{credits}")
    website_raw = clean(paragraphs[3 - noWebsite]).replace("<strong>Website/Socials</strong>: ", "") if len(paragraphs) > 3 - noWebsite else ""
    if (website_raw == "<strong>Plain Language Description</strong>"):
        website = ""
        noWebsite += 1
    else:
        website = normalize_link(website_raw)
        
    # print(f"{website}")
    plain_language = clean(paragraphs[5 - noWebsite]) if len(paragraphs) > (5 - noWebsite) else ""
    # print(f"{plain_language}")

    # Info list
    info_lis = soup.select("ul.schedule li")
    show_type = clean_li(info_lis[0]) if len(info_lis) > 0 else ""
    price = clean_li(info_lis[1]) if len(info_lis) > 1 else ""
    run = clean_li(info_lis[2]) if len(info_lis) > 2 else ""
    playtime = clean_li(info_lis[3]) if len(info_lis) > 3 else ""
    venue = clean_li(info_lis[4]) if len(info_lis) > 4 else ""
    site = clean_li(info_lis[5]) if len(info_lis) > 5 else ""
    age = clean_li(info_lis[6]) if len(info_lis) > 6 else ""
    warnings = clean_li(info_lis[7]) if len(info_lis) > 7 else ""

    location_id = site.split(": ")[0].split("/span> ")[1]
    locationname = location_id + ": " + site.split(": ")[1].strip()

    # Image
    img_tag = soup.select_one("img.event-image-square")
    img_path = ""
    if img_tag and img_tag.get("src"):
        img_url = img_tag["src"]
        ext = os.path.splitext(urlparse(img_url).path)[1]
        img_path = folder / f"{short_id}{ext}"
        if not img_path.exists():
            print(f"[DOWNLOADING]      {img_url}")
            img_data = requests.get(img_url).content
            with open(img_path, "wb") as f:
                f.write(img_data)
            print(f"[DOWNLOAD COMPLETE] Downloaded image for {short_id}")
        else:
            print(f"[SKIP] Image for {short_id} already exists.")

    # Venue HTML + Map HTML
    location_html = clean(soup.select_one("section.venu-main div div div.col-lg-3"))
    map_html = clean(soup.select_one("#map"))

    # Performances
    event_data = soup.select_one("#event-data")
    performances = {}
    if event_data:
        raw = html.unescape(event_data["data-performances"])
        raw_json = json.loads(raw)
        raw_json["dates"] = [convert_date(d) for d in raw_json.get("dates", [])]
        # Convert the keys in "times" to YYYY-MM-DD
        raw_json["times"] = {
            convert_date(k): v for k, v in raw_json.get("times", {}).items()
        }
        performances = raw_json

    # Assemble metadata
    metadata = {
        "image": str(img_path),
        "title": title,
        "description": description,
        "credits": credits,
        "website": website,
        "plain_language": plain_language,
        "show_type": show_type,
        "price": price,
        "run": run,
        "playtime": playtime,
        "venue": venue,
        "site": site,
        "locationId": int(location_id),
        "location": locationname,
        "age": age,
        "warnings": warnings,
        "location_html": location_html,
        "map_html": map_html,
        "performances": performances
    }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"[DONE] Scraped event {short_id}")

if __name__ == "__main__":
    with open(INPUT_FILE) as f:
        event_urls = json.load(f)

    for url in event_urls:
        scrape_event(url)
