const availabilityTranslationDict = {
	"available": "Available",
	"low-availability": "Low",
	"no-availablility": "Sold out"
}
	
export function translateAvailability(availStr) {
	if (availStr in availabilityTranslationDict) return availabilityTranslationDict[availStr];
	return availStr;
}

export function getTotalAvailability(availabilityData, eventKey) {
    const eventAvailability = availabilityData[eventKey];
    if (!eventAvailability) return 0;

    let total = 0;
    let status = null; // Tracks the "highest priority" non-numeric status

    for (const value of Object.values(eventAvailability)) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
            total += parsed;
        } else {
            if (value !== 'available' && value !== 'low-availability') {
                // Unknown status overrides all
                return value;
            } else if (value === 'low-availability') {
                status = translateAvailability(value);
            } else if (value === 'available' && status === null) {
                status = translateAvailability(value);
            }
        }
    }

    return status === null ? total : status;
}

// Function to fetch JSON data
export async function fetchJsonData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

export function getSortedUniqueFieldFromDict(dict, field) {
	const dictArray = Object.values(dict);

	// Extract unique field values
	const uniqueVals = [...new Set(dictArray.map(item => item[field]))];

	// Sort numerically if all values are valid integers
	const sortedUniqueVals = uniqueVals.sort((a, b) => {
		const aNum = parseInt(a, 10);
		const bNum = parseInt(b, 10);
		const aValid = !isNaN(aNum) && aNum.toString() === a.toString();
		const bValid = !isNaN(bNum) && bNum.toString() === b.toString();

		if (aValid && bValid) {
			return aNum - bNum;
		}
		return a.toString().localeCompare(b.toString()); // fallback to string sort
	});

	return sortedUniqueVals;
}

export function getSortedUniqueField(arr, field) {
	// Extract unique field values
	const uniqueVals = [...new Set(arr.map(item => item[field]))];

	// Sort the unique field values
	const sortedUniqueVals = uniqueVals.sort();
	
	return sortedUniqueVals;
}

export function time24format(timeString) {
    // Split the time string by ":" to get parts
    let parts = timeString.split(":");
    
    // Ensure hours and minutes are always present
    let hours = parts[0];
    let minutes = parts[1];
    
    // Return formatted time
    return hours + ":" + minutes;
}

export function getTime(dateObj) {
	if (! dateObj) { 
		return "9:30am";
	}
	/*
	const resultTime = dateObj.toLocaleTimeString('en-US', { hour: "numeric", minute: "2-digit", hour12: true });
	const hours = dateObj.getHours();
	return resultTime.substring(0,5).trim() + (hours < 12 ? 'am' : 'pm');
	*/
	const hours = dateObj.getHours();
	const minutes = dateObj.getMinutes();
	const ampm = hours >= 12 ? 'pm' : 'am';
	const hour12 = hours % 12 || 12;
	const paddedMinutes = minutes.toString().padStart(2, '0');
	return `${hour12}:${paddedMinutes}${ampm}`;
}

export function getHour(dateObj) {
	const hours = dateObj.getHours();
	if (hours < 12) return hours.toString() + 'am';
	return (hours == 12 ? hours + 'pm' : (hours - 12).toString() + 'pm');
}

export function getShortDate(date) {
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function getISODate(dateObj) {
	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getDate()).padStart(2, '0');

	const formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}

export function getSlotLength(startTime, endTime) {
	const timeDifferenceInMilliseconds = endTime - startTime;
    const minutes = Math.floor(timeDifferenceInMilliseconds / 60000);
	// Round to the nearest 5 minutes
	// return number of slots (5 minutes per slot)
    return Math.round(minutes / 5);
}

export function findMaxEndTime(arrayOfObjects) {
  if (!Array.isArray(arrayOfObjects) || arrayOfObjects.length === 0) {
    return null; // Return null for an empty array or invalid input
  }

  let maxEndTime = new Date("1970-01-01T00:00"); // Initialize with the smallest time as a starting point

  for (let obj of arrayOfObjects) {
    if (new Date(obj.endDateTime + "-06:00") > maxEndTime) {
      maxEndTime = new Date(obj.endDateTime + "-06:00");
    }
  }

  return maxEndTime;
}

export function getFollowing() {
    const following = JSON.parse(localStorage.getItem("following")) || {};
	return following;
}

export function getFavourites() {
    const favourites = JSON.parse(localStorage.getItem("favourites")) || {};
	return favourites;
}

export function getHeardList() {
    const heardList = JSON.parse(localStorage.getItem("heardList")) || {};
	return heardList;
}

export function getCompressedShareableURL() {
    let simpleData = localStorage;
	delete simpleData["DataTables_artistTable_/"]
	const data = JSON.stringify(simpleData);
    const compressed = LZString.compressToEncodedURIComponent(data); // Safe for URLs
    const url = `${location.origin}${location.pathname}?share=${compressed}`;
    return url;
}

export function importFromCompressedShareParam() {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get('share');
    if (!compressed) return;

    try {
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        const localStorageData = JSON.parse(json);

        if (!isValidLocalStorageData(localStorageData)) {
            console.error("Invalid localStorage data.");
            return;
        }

        // localStorage.clear();
        Object.keys(localStorageData).forEach(key => {
            const sanitizedValue = sanitizeValue(localStorageData[key]);
            localStorage.setItem(key, sanitizedValue);
        });

        console.log("localStorage successfully restored.");
    } catch (e) {
        console.error("Error restoring data from URL:", e);
	}
}

export function exportLocalStorageToFile(filename) {
    try {
        const localStorageData = JSON.stringify(localStorage);
        const blob = new Blob([localStorageData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log('localStorage exported successfully.');
    } catch (error) {
        console.error('Error exporting localStorage:', error);
    }
}

export function importLocalStorageFromFile(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const localStorageData = JSON.parse(event.target.result);
            
            // Validate and sanitize localStorageData
            if (!isValidLocalStorageData(localStorageData)) {
                console.error('Invalid localStorage data.');
                return;
            }
            
            // Clear existing localStorage
            localStorage.clear();

            // Import validated data into localStorage
            Object.keys(localStorageData).forEach(key => {
                const sanitizedValue = sanitizeValue(localStorageData[key]);
                localStorage.setItem(key, sanitizedValue);
            });

            console.log('localStorage updated successfully.');

            // Force page refresh
            location.reload();
        } catch (error) {
            console.error('Error importing localStorage:', error);
        }
    };

    reader.readAsText(file);
}

function isValidLocalStorageData(data) {
    // Example validation: Ensure data is an object and keys are strings
    return (typeof data === 'object' && data !== null && !Array.isArray(data)) &&
           Object.keys(data).every(key => typeof key === 'string');
}

function sanitizeValue(value) {
    // Example sanitization: Ensure value is a string
    return typeof value === 'string' ? value : JSON.stringify(value);
}


/*
// Function to find the first item with a matching "id" field
function getItemById(array, idValue) {
  return array.find(item => item.id === idValue);
}

function getItemValue(array, idValue, field) {
  return array.find(item => item.id === idValue)[field];
}
*/


// Function to handle the selection of following time slots
export function handleFollowingSelection(artistId, following) {
    const followingList = getFollowing();
    if (following) {
        followingList[artistId] = true;
    } else {
        delete followingList[artistId];
    }
    localStorage.setItem("following", JSON.stringify(followingList));
}

// Function to handle the selection of heard time slots
export function handleHeardSelection(favouriteId, heard) {
    const heardList = getHeardList();
    if (heard) {
        heardList[favouriteId] = true;
    } else {
        delete heardList[favouriteId];
    }
    localStorage.setItem("heardList", JSON.stringify(heardList));
}

// Function to handle the selection of favourite time slots
export function handleFavouriteSelection(favouriteId, favourite) {
    const favourites = getFavourites();
    if (favourite) {
        favourites[favouriteId] = true;
    } else {
        delete favourites[favouriteId];
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
}

export function isFollowing(following, artistId) {
    return following[artistId] || false;
}

// showId (not artist)
export function isFavourite(favourites, showId) {
    return favourites[showId] || false;
}

// showId (not artist)
export function isHeard(heardList, showId) {
    return heardList[showId] || false;
}


export function filterByKeys(data, keysToMatch) {
	const filteredArray = data.filter(item => keysToMatch[item._id]);
	return filteredArray;
}

export function capitalizeFirstLetter(str) {
  if (str.length === 0) return str; // Check if the string is empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}

