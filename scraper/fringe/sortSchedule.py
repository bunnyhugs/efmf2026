import json
from collections import OrderedDict

# Load the existing schedule
with open("schedule.json", "r", encoding="utf-8") as f:
    schedule = json.load(f)

# Sort by date keys
sorted_schedule = OrderedDict(sorted(schedule.items()))

# Write it back to the same file
with open("schedule.json", "w", encoding="utf-8") as f:
    json.dump(sorted_schedule, f, indent=2, ensure_ascii=False)
