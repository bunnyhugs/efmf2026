import * as utils from './utils.js';
// import * as draw from './js';

const appmode = {
	"fringe": false,
	"efmf": true,
	"cfmf": false
}

const report = {};
report.menTotal = 0;
report.notMenTotal = 0;
report.menFollowed = 0;
report.notMenFollowed = 0;
report.menInStarredEvents = 0;
report.notMenInStarredEvents = 0;
report.menHeard = 0;
report.notMenHeard = 0;

var scheduleData;
var locationData;
var artistsData;
var mergedScheduleArray;
var availabilityDict = {};

function getScheduleEvent(showId) {
	return mergedScheduleArray.filter(item => item.showId == showId)[0];
}

// Go through the schedule to count how many times the artistId appears in starred schedule events
function getArtistSchedule(scheduleArray, artistId) {
	let artistSchedule = [];

	scheduleArray.forEach(event => {
		if (Object.keys(event.slugs).includes(artistId)) {
			artistSchedule.push(event);
		}
	});

	return artistSchedule;
}

// Go through the schedule to count how many times the artistId appears in starred schedule events
function countArtist(schedule, artistId) {
	let count = 0;

	schedule.forEach(event => {
		if (Object.keys(event.slugs).includes(artistId)) {
			count++;
		}
	});

	return count;
}

function getStats(header, string1, string2, count1, count2) {
	// "Lineup totals", "Men", "Everyone else", report.menTotal, report.notMenTotal);
	var percent1 = 0;
	var percent2 = 0;
	
	if ((count1 + count2) > 0) {
		percent1 = Math.round(100 * count1 / (count1 + count2)) / 1;
		percent2 = Math.round(100 * count2 / (count1 + count2)) / 1;
	}
	let result = `<b>${header}</b>`;
	result += `<ul>`;
	result += `<li><span class="gender">${string2}:</span> ${count2} <span class="percent">(${percent2}%)</span></li>`;
	result += `<li><span class="gender">${string1}:</span> ${count1} <span class="percent">(${percent1}%)</span></li>`;
	result += `</ul>`;	
	
	return result;
}

// Formatting function for extra row details
function openArtistRow(artist) {
	let artistRowElem = document.createElement("div");
	artistRowElem.classList.add("artistRow");
	
	if (appmode["fringe"]) loadEvent(artist.id);
	addArtistInfoToElement(artistRowElem, artist, false, null);

	return artistRowElem;
}

function addArtistInfoToElement(artistElement, artist, isFullCard, artistSchedule) {

	const festUrl = artist.socials.fest;
	const photo = `<img class="artistPhoto" alt="${artist.name}" src=${artist.image} />`;
	const fest = '<img class="socialLink fest" alt="Festival artist page" src="fest-logo.png" />';
	const websiteSvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" style="fill: currentcolor;"></path></svg>';
	const facebookSvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H15.5A3.5,3.5 0 0,0 12,8.5V11H10V14H12V21H15V14H18V11H15V9A1,1 0 0,1 16,8H18V5Z" style="fill: currentcolor;"></path></svg>';
	const twitterSvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" style="fill: currentcolor;"></path></svg>';
	const instagramSvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" style="fill: currentcolor;"></path></svg>';
	const itunesSvg = '<svg fill="#000000" width="24" height="24" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><title>itunes</title><path d="M21.135 22.899c0.891-0.251 1.577-0.941 1.818-1.816l0.004-0.018 0.077-0.27 0.010-7.23c0.008-5.416 0-7.265-0.030-7.367-0.030-0.104-0.081-0.194-0.148-0.268l0 0.001c-0.094-0.057-0.208-0.091-0.33-0.091-0.005 0-0.010 0-0.015 0h0.001c-0.266 0.022-0.506 0.057-0.74 0.104l0.040-0.007c-1.301 0.237-8.967 1.763-9.099 1.812-0.215 0.087-0.388 0.242-0.496 0.437l-0.084 0.165s-0.039 11.334-0.097 11.462c-0.097 0.2-0.262 0.354-0.464 0.435l-0.006 0.002q-0.378 0.098-0.761 0.171c-0.99 0.063-1.884 0.43-2.602 1.008l0.009-0.007c-0.273 0.273-0.472 0.621-0.563 1.010l-0.003 0.014c-0.031 0.15-0.048 0.323-0.048 0.5 0 0.27 0.041 0.53 0.117 0.775l-0.005-0.018c0.126 0.352 0.328 0.65 0.589 0.886l0.002 0.002c0.238 0.183 0.52 0.323 0.826 0.401l0.016 0.004c0.213 0.036 0.458 0.056 0.708 0.056 0.725 0 1.409-0.172 2.014-0.478l-0.026 0.012c0.331-0.21 0.608-0.471 0.828-0.777l0.006-0.009c0.091-0.142 0.174-0.306 0.243-0.478l0.007-0.020c0.22-0.57 0.226-10.723 0.255-10.851 0.040-0.21 0.195-0.375 0.396-0.429l0.004-0.001c0.184-0.050 7.567-1.508 7.775-1.537 0.027-0.005 0.057-0.008 0.088-0.008 0.143 0 0.271 0.061 0.361 0.158l0 0c0.056 0.029 0.102 0.069 0.135 0.119l0.001 0.001c0.076 0.64 0.12 1.382 0.12 2.134 0 0.474-0.017 0.943-0.051 1.408l0.004-0.062c0.010 3.699 0.015 3.614-0.186 3.848-0.146 0.17-0.329 0.236-1.080 0.387-0.735 0.107-1.398 0.303-2.018 0.578l0.049-0.019c-0.481 0.206-0.861 0.572-1.078 1.031l-0.005 0.013c-0.143 0.267-0.228 0.584-0.228 0.92 0 0.008 0 0.015 0 0.023v-0.001c-0 0.008-0 0.016-0 0.025 0 0.608 0.265 1.154 0.685 1.529l0.002 0.002c0.044 0.043 0.086 0.082 0.13 0.121 0.222 0.174 0.488 0.302 0.778 0.365l0.013 0.002c0.192 0.026 0.415 0.040 0.641 0.040 0.502 0 0.988-0.072 1.446-0.207l-0.036 0.009zM7.881 27.338c2.25 1.643 5.072 2.63 8.124 2.63 4.635 0 8.738-2.274 11.255-5.768l0.028-0.041c1.633-2.263 2.611-5.092 2.611-8.15 0-4.648-2.261-8.768-5.743-11.32l-0.039-0.027c-2.25-1.644-5.072-2.63-8.123-2.63-4.634 0-8.738 2.274-11.254 5.768l-0.028 0.041c-1.633 2.263-2.612 5.093-2.612 8.151 0 4.648 2.261 8.768 5.743 11.32l0.039 0.027zM15.971 30.994c-7.396-0.031-13.524-5.426-14.694-12.494l-0.012-0.087c-0.126-0.731-0.199-1.573-0.199-2.431 0-7.409 5.379-13.562 12.445-14.766l0.089-0.012c0.716-0.121 1.54-0.191 2.381-0.191 7.417 0 13.571 5.404 14.741 12.489l0.012 0.087c0.126 0.731 0.199 1.573 0.199 2.431 0 7.409-5.379 13.562-12.445 14.766l-0.089 0.012c-0.73 0.124-1.57 0.196-2.428 0.196h-0z"></path></svg>';
	const bandcampSvg = '<img src="bandcamp.png" style="margin: 0px 15px;" />';
	const youtubeSvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" style="fill: currentcolor;"></path></svg>';
	const spotifySvg = '<svg viewBox="0 0 24 24" class="socialLink"><path d="M17.9,10.9C14.7,9 9.35,8.8 6.3,9.75C5.8,9.9 5.3,9.6 5.15,9.15C5,8.65 5.3,8.15 5.75,8C9.3,6.95 15.15,7.15 18.85,9.35C19.3,9.6 19.45,10.2 19.2,10.65C18.95,11 18.35,11.15 17.9,10.9M17.8,13.7C17.55,14.05 17.1,14.2 16.75,13.95C14.05,12.3 9.95,11.8 6.8,12.8C6.4,12.9 5.95,12.7 5.85,12.3C5.75,11.9 5.95,11.45 6.35,11.35C10,10.25 14.5,10.8 17.6,12.7C17.9,12.85 18.05,13.35 17.8,13.7M16.6,16.45C16.4,16.75 16.05,16.85 15.75,16.65C13.4,15.2 10.45,14.9 6.95,15.7C6.6,15.8 6.3,15.55 6.2,15.25C6.1,14.9 6.35,14.6 6.65,14.5C10.45,13.65 13.75,14 16.35,15.6C16.7,15.75 16.75,16.15 16.6,16.45M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" style="fill: currentcolor;"></path></svg>';

	var artistHtml = artistElement.innerHTML;

	if (isFullCard) {
		// add name, geo, and photo
		const artistFollowName = generateArtistFollowName(artist);
		artistElement.appendChild(artistFollowName);
		artistHtml += '<div class="artistCardHeader">';
		if (appmode["fringe"]) {
			artistHtml += `<span>${artist.name}</span>`;
		}
		artistHtml += `<span>${artist.geo}</span></div>`;
		artistHtml += artistSchedule.outerHTML;
		artistHtml += `<img src='${artist.image}' alt="${artist.name}"><p>`;
	}

	if (artist.slug) {
		artistHtml += `<a href=${festUrl} title="Festival artist page" target="_blank">${fest}</a>`;
	}
	if (artist.socials.website) {
		artistHtml += `<a href=${artist.socials.website} title="Website" target="_blank">${websiteSvg}</a>`;
	} else {
		// check for School of Song websites
		for (var key in artist) {
			if (key.includes(" website")) {
				var specificArtistName = key.replace(" website", "");
				artistHtml += `<a href=${artist[key]} title="${specificArtistName} Website" target="_blank">${websiteSvg} ${specificArtistName}</a>`;
			}
		}
	}
	if (artist.socials.facebook) {
		artistHtml += `<a href=${artist.socials.facebook} title="Facebook" target="_blank">${facebookSvg}</a>`;
	}
	if (artist.socials.twitter) {
		artistHtml += `<a href=${artist.socials.twitter} title="Twitter" target="_blank">${twitterSvg}</a>`;
	}
	if (artist.socials.instagram) {
		artistHtml += `<a href=${artist.socials.instagram} title="Instagram" target="_blank">${instagramSvg}</a>`;
	}
	if (artist.socials.youtube) {
		artistHtml += `<a href=${artist.socials.youtube} title="YouTube" target="_blank">${youtubeSvg}</a>`;
	}
	if (artist.socials.bandcamp) {
		artistHtml += `<a href=${artist.socials.bandcamp} title="Bandcamp" target="_blank">${bandcampSvg}</a>`;
	}
	if (artist.socials.itunes) {
		artistHtml += `<a href=${artist.socials.itunes} title="Spotify" target="_blank">${itunesSvg}</a>`;
	}
	if (artist.socials.spotify) {
		artistHtml += `<a href=${artist.socials.spotify} title="Spotify" target="_blank">${spotifySvg}</a>`;
	}
	
	if (!isFullCard) {
		// this info comes at the end for the artist table
		if (artist.image) {
			artistHtml += photo;
		}
		if (artist.artistScheduleString) {
			let artistId = (appmode["fringe"]) ? artist.id : artist.slug;

			artistHtml += `<div class="artistSchedule">${artistsData[artistId].artistScheduleString}</div>`;
			// update full card schedule too
			let fullArtistCard = document.getElementById(`artist-${artistId}`);
			let fullCardSchedule = fullArtistCard.querySelector('div.artistSchedule');
			fullCardSchedule.innerHTML = `${artistsData[artistId].artistScheduleString}`;
		}
		artistHtml += `</p><div class="artistDataTableBio">${artist.bio}</div>`;
	} else {
		if (artist.bio) {
			artistHtml += '<div class="artistDataTableBio">' + artist.bio + '</div>';
		}
	}
	artistElement.innerHTML = artistHtml;
	return artistElement;
}


///////////////////////////////////////////////////////////////////////////////////
// POPULATE FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

async function populateLocations() {
	locationData = await utils.fetchJsonData("locations.json");
	return locationData;
}

// Function to async fetch the artist data
async function populateArtists() {
	const artistsData = await utils.fetchJsonData("artists.json");

	return artistsData;
}

function toggleFollowArtistHandler(event) {
	console.log("toggleFollowArtistHandler");
	const followIcon = event.target.closest('.dt-followArtist');
	const artistId = followIcon.dataset.artistId;
	const artist = artistsData[artistId];
	toggleFollowArtist(artist, followIcon);
}

function generateArtistFollowName(artist) {
	// artistCard.innerHTML += `<h3>${artist.name}</h3>`;
	const followIcon = document.createElement('div');
	followIcon.classList.add('dt-followArtist');
	
	followIcon.dataset.artistId = artist.slug;
	const followingList = utils.getFollowing();
	const following = utils.isFollowing(followingList, artist.slug);
	followIcon.title = "Follow artist";

	if (following) {
		followIcon.classList.add('following');
	}
	
	const header = document.createElement('h3');
	header.textContent = `${artist.name}`;
	followIcon.appendChild(header);
	
	return followIcon;
}

function generateArtistSchedule(artist) {
	const artistSchedule = getArtistSchedule(mergedScheduleArray, artist.slug);
	if (!artistSchedule || artistSchedule.length === 0) return document.createElement('div');

	const favourites = utils.getFavourites();
	const heardList = utils.getHeardList();
	const hasArtistTickets = "tickets" in artist;

	if (!hasArtistTickets) artist.tickets = 0;

	artist.artistSchedule = artistSchedule.sort((a, b) => a.startDateObj - b.startDateObj);

	const artistScheduleDiv = document.createElement('div');
	artistScheduleDiv.classList.add("artistSchedule");

	const fragment = document.createDocumentFragment();

	artist.artistSchedule.forEach((event, index) => {
		// Cache/show-level info
		const showId = event.showId;
		const location = locationData[event.locationId];
		const slugId = Object.keys(event.slugs)[0];
		const availability = (appmode["fringe"]) ? utils.translateAvailability(availabilityDict[artist.id][showId]) : 0;

		// Ensure start/end date objects exist
		if (!event.startDateObj) {
			event.startDateObj = new Date(`${event.startDate}T${event.startTime}-06:00`);
			event.endDateObj = new Date(`${event.endDateTime}-06:00`);
		}

		// Ticket availability tally
		if (appmode["fringe"]) {
			if ((Number.isInteger(Number(artist.tickets))) && (Number.isInteger(Number(availability)))) {
				// we have a real availability count still for this artist
				// we have a real ticket count for this event
				artist.tickets += availability;
			} else {
				// text availability only
				if (artist.tickets == 'Available' && availability == 'low-availability') {
					artist.tickets = utils.translateAvailability(availability);
				} else if (availability != 'available' && (!Number.isInteger(Number(availability)))) {
					artist.tickets = utils.translateAvailability(availability);
				} else {
					// don't update noop
				}
			}
		}

		const startDate = utils.getShortDate(event.startDateObj);
		const time = `${utils.getTime(event.startDateObj)}–${utils.getTime(event.endDateObj)}`;

		if (event.type !== "other") {
			// Favourite star
			const scheduleStar = document.createElement('span');
			scheduleStar.classList.add("scheduleStar", "favouriteContainer", "scheduleList");
			scheduleStar.dataset.favouriteId = showId;
			scheduleStar.dataset.slugId = slugId;
			scheduleStar.classList.add(utils.isFavourite(favourites, showId) ? "favouriteOn" : "favouriteOff");
			scheduleStar.addEventListener('mousedown', handleStarMouseDown);
			scheduleStar.addEventListener('mouseup', handleStarMouseUp);
			fragment.appendChild(scheduleStar);

			// Heard icon
			const scheduleHeard = document.createElement('span');
			scheduleHeard.classList.add("scheduleHeard", "favouriteContainer", "scheduleList");
			scheduleHeard.dataset.favouriteId = showId;
			scheduleHeard.dataset.slugId = slugId;
			scheduleHeard.classList.add(utils.isHeard(heardList, showId) ? "heard" : "unheard");
			scheduleHeard.addEventListener('mousedown', handleStarMouseDown);
			scheduleHeard.addEventListener('mouseup', handleStarMouseUp);
			fragment.appendChild(scheduleHeard);
		}

		// Event date/time
		const eventDate = document.createElement('span');
		eventDate.classList.add("eventTime");
		eventDate.textContent = `${startDate}, ${time}`;
		fragment.appendChild(eventDate);

		
		// Event location/capacity
		const eventDetails = document.createElement('span');
		eventDetails.classList.add("eventLocation");
		eventDetails.textContent = (!appmode["fringe"]) ? event.location : `${availability}/${location.maxCapacity}`;
		fragment.appendChild(eventDetails);

		// Line break between events
		if (index !== artist.artistSchedule.length - 1) {
			fragment.appendChild(document.createElement('br'));
		}
	});

	// Append all at once
	artistScheduleDiv.appendChild(fragment);

	// Cache HTML if needed later
	artist.artistScheduleString = artistScheduleDiv.innerHTML;
	let artistId = (appmode["fringe"]) ? artist.id : artist.slug;
	artistsData[artistId].artistScheduleString = artist.artistScheduleString;

	return artistScheduleDiv;
}

// Fill the (hidden) artist section with artist card info and photo (tool tips)
function fillArtistSection(artistsData) {
	const artistsSection = document.getElementById("artists-section");
	const scheduleSection = document.getElementById("schedule-section");

	for (const artistId in artistsData) {
		const artist = artistsData[artistId];
		const festUrl = artist.socials.fest;

		
		if (artist.shows.length > 0) {
			var artistExists = false;
			if (document.getElementById('artist-' + artistId)) {
				artistExists = true;
			}
			const artistCard = (document.getElementById('artist-' + artistId)) ?? document.createElement("div");
			artistCard.id = 'artist-' + artistId;
			artistCard.classList.add("artistCard");
			artistCard.classList.add("popup");
			artistCard.textContent = '';

			const artistSchedule = generateArtistSchedule(artist);

			addArtistInfoToElement(artistCard, artist, true, artistSchedule);

			// if (! artistExists) artistsSection.appendChild(artistCard);
			if (! artistExists) scheduleSection.appendChild(artistCard);

			/*
			if (artist.heardCount) {
				for (let i = 0; i < artist.heardCount; i++) {
					artistCard.innerHTML += "<img class='artistCardIcon'  title='Heard' alt='Heard' src='./heard.png' />";
				}
			}
			if (artist.starredCount) {
				for (let i = 0; i < artist.starredCount; i++) {
					artistCard.innerHTML += "<img class='artistCardIcon'  title='Starred' alt='Starred' src='./star-on.png' />";
				}
			}
			*/
			
		} else {
			if (artist.name.toUpperCase() !== artist.name) console.log(`${artist.name} (${artistId}) found, but no event attached.`);
		}
    }
}



// Initialize artist listing page
function initArtistListing() {
	const artistListSection = document.getElementById("artistList-section");
	const artistListContainer = document.createElement("div");
	artistListContainer.classList.add("artistListContainer");
	artistListSection.appendChild(artistListContainer);

	const artistList = document.createElement("div");
	artistList.classList.add("artistList");
	artistListContainer.appendChild(artistList);

	if (!appmode["fringe"]) {
		const artistListStats = document.createElement("div");
		artistListStats.id = "artistListStats";
		artistList.appendChild(artistListStats);
	}

	const artistsTableData = { "data": [] };
	const artistsTableColumns = [
	    {
            className: 'dt-control dt-control2',
            orderable: false,
            data: null,
            defaultContent: ''
        },
	    {
            className: 'dt-followArtist',
            orderable: false,
            data: null,
            defaultContent: ''
        },
		{ data: 'name', className: 'dt-control2' },
		{ data: 'genre', className: 'dt-control2' },
		{ data: 'site', className: 'dt-control2' },
		{ data: 'price', className: 'dt-control2', visible: appmode["fringe"] },
		{ data: 'availability', className: 'dt-control2', visible: appmode["fringe"] },
		{ data: 'runtime', className: 'dt-control2', visible: appmode["fringe"] },
		{ data: 'appearances', className: 'dt-control2' },
		{ data: 'starred', className: 'dt-control2' },
		{ data: 'listened', className: 'dt-control2' },
		{ data: 'bio', className: 'dt-control2', visible: false, searchable: true },
		{ data: 'slug', className: 'dt-control2', visible: false, searchable: true }
		];

	const artistTable = document.createElement("table");
	artistTable.id = "artistTable";
	artistTable.classList.add("artistTable", "compact", "display");
	const artistTableHead = document.createElement("thead");
	artistTableHead.innerHTML = `<tr><th></th><th><img src='./follow-on.png'  title='Follow artist' alt='Follow artist' /></th><th>Name</th><th title='Genre'>Type</th><th title='Site'>${appmode["fringe"] ? "Site" : "Geo"}</th><th title='Price'>Price</th><th title='Availability'>Avail Tix</th><th title='Runtime'>Run time</th><th title='# of scheduled performances'>Perf</th><th><img alt='Starred'  title='Starred' src='./star-on.png' /></th><th><img alt='Heard'  title='Heard' src='./heard.png' /></th></tr>`;
	artistTable.appendChild(artistTableHead);
	// const artistTableFoot = document.createElement("tfoot");
	// artistTableFoot.innerHTML = artistTableHead.innerHTML;
	// artistTable.appendChild(artistTableFoot);
	artistList.appendChild(artistTable);

	let ordering = [];
	if (appmode["fringe"]) {
		ordering = [[9, 'desc'], [10, 'desc'], [8, 'asc'], [2, 'asc']];
	} else {
		ordering = [[5, 'desc'], [6, 'desc'], [4, 'asc'], [2, 'asc']];
	}

	const dataTable = new DataTable( '#artistTable', { 
		paging: false,
		scrollX: true,
		scrollY: "min(60vh, 600px)",
		stateSave: true, 
		order: ordering,
		columns: artistsTableColumns,
		data: artistsTableData.data,
		createdRow: function(row, data, dataIndex) {
			var value = data["following"];
			var cell = $('td', row).eq(1); // Select the second <td> in the row
			cell.prop('title', "Follow artist");
			if (value) {
				cell.addClass('following');
			}
			$(row).attr('id', 'artistDataTableRow-' + data["slug"]);
		}
	});

	fillArtistDataTable();
	drawArtistDataTable();
  
	// Add event listener for opening and closing details
	// dataTable.on('click', 'td.dt-control', expandDataTableRow);	
	dataTable.on('click', 'td.dt-control2', function (e) {
		let tr = e.target.closest('tr');
		let row = dataTable.row(tr);
	 
		if (row.child.isShown()) {
			// This row is already open - close it
			row.child.hide();
		}
		else {
			// Open this row
			row.child(openArtistRow(row.data())).show();
			const scheduleFlags = row.child()[0].querySelectorAll('.scheduleList');
			scheduleFlags.forEach((scheduleFlag) => {
				scheduleFlag.addEventListener('mousedown', handleStarMouseDown);
				scheduleFlag.addEventListener('mouseup', handleStarMouseUp);
			});
			
		}
	});	

	// Add event listener for opening and closing details
	dataTable.on('click', 'td.dt-followArtist', function (e) {
		let tr = e.target.closest('tr');
		let artist = dataTable.row(tr).data();

		toggleFollowArtist(artist, e.target);
	});	

}

function drawArtistDataTable() {
	const artistTable = $('#artistTable').DataTable();
	artistTable.draw();
}

function mergeSchedules() {
	// Object to store the merged schedule
	const mergedSchedule = {};

	// Iterate through each element in the main dictionary
	for (const schedDate in scheduleData) {
		if (scheduleData.hasOwnProperty(schedDate)) {
			const element = scheduleData[schedDate];
			const daySchedule = element.schedule;

			// Merge the schedule into the mergedSchedule object
			for (const showId in daySchedule) {
				if (daySchedule.hasOwnProperty(showId)) {
					mergedSchedule[showId] = daySchedule[showId];
				}
			}
		}
	}
	// mergedScheduleArray = utils.getSortedUniqueFieldFromDict(mergedSchedule, 'startDate');
	mergedScheduleArray = Object.values(mergedSchedule);
	return mergedScheduleArray;
}

function findAndUpdateArtistDataTableRow(artistId) {
	const artist = artistsData[artistId];
	const artistTable = $('#artistTable').DataTable();

	const rowId = `#artistDataTableRow-${artistId}`;
	var dataTableRowToUpdate = artistTable.row(`${rowId}`);
	var currentData = dataTableRowToUpdate.data();

	currentData["starred"] = artist.starredCount;
	currentData["listened"] = artist.heardCount;

	if (appmode["fringe"]) {
		var totalTickets = utils.getTotalAvailability(availabilityDict, artistId);
		currentData["availability"] = totalTickets;

		if (artist.tickets != totalTickets) {
			generateArtistSchedule(artist);

			let artistRow = document.getElementById(`artistDataTableRow-${artistId}`);
			if (artistRow) {
				let detailsRow = artistRow.nextElementSibling;
				let artistScheduleElement = detailsRow.querySelector('div.artistSchedule');
				artistScheduleElement.innerHTML = artist.artistScheduleString;
			}
			// update full card schedule too
			let fullArtistCard = document.getElementById(`artist-${artistId}`);
			let fullCardSchedule = fullArtistCard.querySelector('div.artistSchedule');
			fullCardSchedule.innerHTML = artist.artistScheduleString;
			
			artist.tickets = totalTickets;
		}
	}
	
	// update the data
	dataTableRowToUpdate.data(currentData);
}


function updateArtistDataTableRow(artistTable, artistId)
{
	const artist = artistsData[artistId];
	
	if (('type' in artist) && artist.type == "Session") {
		return;
	}

	generateArtistSchedule(artist);

	const artistSchedule = getArtistSchedule(mergedScheduleArray, artist.slug);
	// count number of performances
	const appearances = countArtist(artistSchedule, artist.slug);

	const artistRowData = {
			"name": artist.title,
			"genre": (appmode["fringe"]) ? artist.geo.replace('<span> <img alt=\"\" src=\"/images/icon_type.svg\"/> </span> ', '') : (artist.mainstage) ? 'Headline' : '',
			"site": (appmode["fringe"]) ? artist.locationId : artist.geo,
			"price": artist.price ?? 0,
			"availability": artist.tickets ?? 0,
			"runtime": artist.runtime ?? 0,
			"appearances": appearances,
			"starred": artist.starredCount,
			"listened": artist.heardCount,
			"bio": artist.bio,
			"slug": artist.slug,
			...artist
			
	};
	
	artistTable.row.add(artistRowData);
}

function updateGenderReport() {
	if (appmode["fringe"]) return;
	
	const artistListStats = document.getElementById('artistListStats');
	let artistListStatsHtml = '';	
	artistListStatsHtml += '<i>Approximate gender presentation statistics:</i><br />'
	artistListStatsHtml += getStats("Lineup totals", "Men", "Everyone else", report.menTotal, report.notMenTotal);
	artistListStatsHtml += getStats("Starred count", "Men", "Everyone else", report.menInStarredEvents, report.notMenInStarredEvents);
	artistListStatsHtml += getStats("Attended count", "Men", "Everyone else", report.menHeard, report.notMenHeard);
	artistListStats.innerHTML = artistListStatsHtml;
}

function fillArtistDataTable() {
	setTimeout(() => {

		console.log("fillArtistTable()");

		const artistTable = $('#artistTable').DataTable();
		artistTable.clear();

		const heardList = utils.getHeardList();
		const favourites = utils.getFavourites();

		const followingList = utils.getFollowing();
		// list of the starred events
		const heardIds = new Set(Object.keys(heardList));
		const starredIds = new Set(Object.keys(favourites));
		const heardSchedule = mergedScheduleArray.filter(show => heardIds.has(show.showId));
		const starredSchedule = mergedScheduleArray.filter(show => starredIds.has(show.showId));

		for (const artistId in artistsData) {
			const artist = artistsData[artistId];
			const starredCount = countArtist(starredSchedule, artist.slug);
			const heardCount = countArtist(heardSchedule, artist.slug);
			artist.starredCount = starredCount;
			artist.heardCount = heardCount;
			artist.geo = artist.geo ?? '';

			updateArtistDataTableRow(artistTable, artistId);

			if (!appmode["fringe"]) {
				report.menTotal += artist.men;
				report.notMenTotal += artist.notMen;
				// console.log("artistId " + artistId);
				// add up the number of times each artistId appears in favouriteSchedule (as artistId or in artistIds[])
				report.menInStarredEvents += artist.men * starredCount;
				report.notMenInStarredEvents += artist.notMen * starredCount;

				report.menHeard += artist.men * heardCount;
				report.notMenHeard += artist.notMen * heardCount;
			}
		}
		updateGenderReport();

		// highlight followed artist: style schedule-item and artistLink for followed artistId
		highlightFollowedArtists();
		console.log("fillArtistTable() complete");

	}, 0);
}

// This is the left column with the times in 5-minute increments
function buildTimeColumn(timeHeader, dateObj, endDateObj) {
	const locationHeader = document.createElement("div");
	locationHeader.classList.add("location-header", "time-slot");
	locationHeader.textContent = " ";
	timeHeader.appendChild(locationHeader);

	const endBufferTime = (appmode["fringe"]) ? -120*60*1000 : -30*30*1000;

	// populate time column
	while ((endDateObj - dateObj) >= endBufferTime) {
		const timeSlot = document.createElement("div");
		timeSlot.classList.add("time-slot");

		// Format the result as "hh:mm" string
		// console.log(getTime(dateObj));
		//const time24 = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
		const time24 = String(dateObj.getHours()).padStart(2, '0') + ":" + String(dateObj.getMinutes()).padStart(2, '0');

		if (dateObj.getMinutes() == 30) {
			timeSlot.classList.add("time-slot-half-hour");
			// console.log("half hour");
		}
		if (dateObj.getMinutes() == 0) {
			timeSlot.classList.add("time-slot-hour");
			// console.log("hour");
			if (utils.getHour(dateObj) == "0am") {
				timeSlot.textContent = "12am";
			} else {
				timeSlot.textContent = utils.getHour(dateObj);
			}
		} else {
			timeSlot.textContent = utils.getTime(dateObj);
		}
		
		timeSlot.dataset.time = time24;
		timeHeader.appendChild(timeSlot);

		// Add five minutes to the Date object
		dateObj.setMinutes(dateObj.getMinutes() + 5);
	}
		
}

// This is the name of the location (e.g. "Stage 1") and its data-tip
function buildLocationHeader(locationId, isFavouriteColumn) {
	const locationHeader = document.createElement("div");
	locationHeader.classList.add("location-header");

	if (isFavouriteColumn) {
		locationHeader.textContent = "Favourites";
		return locationHeader;
	}

	const location = locationData[locationId];
	if (location) {
		if (!appmode["fringe"]) {
			locationHeader.dataset.tip = `${location.shortDesc} <br /><img alt='Map of ${location.shortDesc}' src='map${locationId}.jpg' />`;
		} else {
			locationHeader.dataset.tip = `${location.shortDesc} <br>Max capacity: ${location.maxCapacity}`;
		}
		locationHeader.textContent = location.name;
		if (location.altName) {
			locationHeader.innerHTML += ` <span class="altName">${location.altName}</span>`;
		}
	} else {
		locationHeader.textContent = `Location ${locationId}`;
	}
	return locationHeader;
}

// returns array of artist OBJECTS
function getEventArtistList(event) {
	var artistList = [];
	if (event.type == "Session") {
		Object.keys(event.slugs).forEach(artistId => {
			const artist = artistsData[artistId];
			if (! artist ) {
				console.log("Can't find session artist " + artistId);
			} else {
				artistList.push(artist);
			}
		});
	} else {
		const artist = artistsData[Object.keys(event.slugs)[0]];
		artistList.push(artist);
	}
	return artistList;
}

function buildEvent(startDate, event, favourites, heardList) {
	const eventStartDateObj = new Date(`${startDate}T${event.startTime}-06:00`);
	// const eventStartDateObj = new Date(`${event.startDateTime}-06:00`);
	const eventEndDateObj = new Date(`${event.endDateTime}-06:00`);

	var slotItem = document.createElement("div");
	var slotItemHTML = "";
	// const location = utils.getItemById(Object.values(locationData), event.location);
	// const locationId = event.locationId;
	slotItem.classList.add("schedule-item");

	event.startDateObj = eventStartDateObj;
	event.endDateObj = eventEndDateObj;

	// set length based on event duration
	const slotLength = utils.getSlotLength(eventStartDateObj, eventEndDateObj);
	slotItem.classList.add("slot-length-" + slotLength);

	if (event.type == "Session") {
		slotItemHTML = '<div class="time">' + utils.getTime(eventStartDateObj) + '–' + utils.getTime(eventEndDateObj) + '</div>';
		slotItem.classList.add("session");
		slotItemHTML += '<div class="name">' + event.showName + '</div>';
		slotItemHTML += `<div class="location">${event.location}</div>`;
		slotItemHTML += '<div class="artists">';
		// list the artists at a session
		// console.log(event.title);

		// mark the item in "artistsData" as a session
		//const session = artistsData[event.artistId];
		//session.type = "session";

		let artistIndex = 0;
		Object.keys(event.slugs).forEach(artistId => {
			const artist = artistsData[artistId];
			if (! artist ) {
				console.log("Can't find session artist " + artistId);
			} else {
				slotItemHTML += `<a href="#${artist.slug}" title="${artist.name}" class="artistLink" data-tip=" " data-artistId="${artist.slug}">${artist.name}</a>`;
				if (artistIndex++ < Object.keys(event.slugs).length - 1) {
					slotItemHTML += " &bullet; ";
				}
			}
		});
		if (event.hasOwnProperty('showDesc') && event.showDesc !== null && event.showDesc !== undefined && event.showDesc.length > 10) {
			slotItemHTML += `<div class="showDesc">&bullet; ${event.showDesc}</div>`;
		}
		slotItemHTML += '</div>';
		slotItemHTML += '<div class="type">' + utils.capitalizeFirstLetter(event.type) + '</div>';
		slotItem.innerHTML = slotItemHTML;
	} else {
		// Time div
		const timeDiv = document.createElement('div');
		timeDiv.className = 'time';
		timeDiv.textContent = utils.getTime(eventStartDateObj) + '–' + utils.getTime(eventEndDateObj);
		slotItem.appendChild(timeDiv);
		
		slotItem.classList.add("concert");
		// list the artist for a concert
		const artist = artistsData[Object.keys(event.slugs)[0]];
		
		// console.log("[" + timeDiv.textContent + "] " + artist.name);

		// Name div
		const nameDiv = document.createElement('div');
		nameDiv.className = 'name';

		const link = document.createElement('a');
		link.title = artist.name;
		link.href = `#${artist.slug}`;
		link.className = 'artistLink';
		link.setAttribute('data-tip', ' ');
		link.setAttribute('data-artistId', artist.slug);
		link.textContent = artist.name;

		nameDiv.appendChild(link);
		slotItem.appendChild(nameDiv);

		// Location div
		const locationDiv = document.createElement('div');
		locationDiv.className = 'location';
		locationDiv.textContent = event.location;
		slotItem.appendChild(locationDiv);

		// Artist image div
		const imageDiv = document.createElement('div');
		imageDiv.className = 'artistImage';

		const img = document.createElement('img');
		img.src = artist.image;
		img.alt = artist.name;

		imageDiv.appendChild(img);
		slotItem.appendChild(imageDiv);

		const typeDiv = document.createElement('div');
		typeDiv.className = 'type';
		typeDiv.textContent = utils.capitalizeFirstLetter(event.type);
		slotItem.appendChild(typeDiv);
	}
	
	if (event.type != "other") {
		const favouriteStar = document.createElement("div");
		const star = document.createElement("div");
		favouriteStar.appendChild(star);
		slotItem.appendChild(favouriteStar);

		favouriteStar.classList.add("favouriteStar");
		favouriteStar.addEventListener('mousedown', handleStarMouseDown);
		favouriteStar.addEventListener('mouseup', handleStarMouseUp);
		star.classList.add("star");
		// star.dataset.tip = "Add to favourites";
		star.textContent = "Add to starred";

		// Here we are favouriting events, not artists, so use the event.showId. (For artists, we will use event.artistId)
		const favouriteId = event.showId;
		if (utils.isFavourite(favourites, favouriteId)) {
			slotItem.classList.add("favouriteOn");
		} else {
			slotItem.classList.add("favouriteOff");
		}
		if (utils.isHeard(heardList, favouriteId)) {
			slotItem.classList.add("heard");
		} else {
			slotItem.classList.add("unheard");
		}
		slotItem.classList.add("favouriteContainer");
		slotItem.dataset.favouriteId = favouriteId;
		slotItem.dataset.slugId = Object.keys(event.slugs)[0];


		const heardItContainer = document.createElement("div");
		const heardIt = document.createElement("div");
		heardItContainer.appendChild(heardIt);
		slotItem.appendChild(heardItContainer);

		heardItContainer.classList.add("heardItStar");
		heardItContainer.addEventListener('mousedown', handleStarMouseDown);
		heardItContainer.addEventListener('mouseup', handleStarMouseUp);
		heardIt.classList.add("heardIt");
		slotItem.classList.add("unheard");

		heardIt.textContent = "Mark as attended";
	}	

	return slotItem;
}

function getLocationSchedule(favourites, locationId, daySchedule, isFavouriteColumn)
{
	return (isFavouriteColumn) ?
		// this is the list of favourite events happening on this particular day
		daySchedule.filter(item => favourites.hasOwnProperty(item.showId)) :
		daySchedule.filter(item => {return (item.locationId == locationId)});
}

// These are the individual event cards on the schedule. This fills the columns (locations) of the page
function buildEventsForLocation(locationId, startDate, startTime, daySchedule, isFavouriteColumn) {
	const heardList = utils.getHeardList();
	const favourites = utils.getFavourites();
	const locationCol = document.createElement("div");
	locationCol.classList.add("location-column");
	if (isFavouriteColumn) {
		locationCol.classList.add("favourites");
	}

	// console.log("[" + performance.now() + "] build events for location " + locationId);
	const locationHeader = buildLocationHeader(locationId, isFavouriteColumn);
	locationCol.appendChild(locationHeader);
	locationCol.dataset.startDate = startDate;
	locationCol.dataset.startTime = startTime;

	// initialize dateObj to in preparation to go through from the start of the programming day
	const dateObj = new Date(startTime);

	// end time for this particular location on this particular day

	// get the list of events happening on this day (or favourites) at this location
	const locSchedule = getLocationSchedule(favourites, locationId, daySchedule, isFavouriteColumn);

	// const locSpecificEndTime = utils.findMaxEndTime(locSchedule);
	const endDateLocObj = utils.findMaxEndTime(locSchedule);
	// console.log(endDateLocObj);
	// const endDateLocObj = new Date(`${startDate}T${locSpecificEndTime}-06:00`);
	const locationColFavouritesDiv = locationCol.closest('div.favourites');

	const scheduleByTime = {};
	locSchedule.forEach(item => {
		const time = utils.time24format(item.startTimeRounded);
		if (!scheduleByTime[time]) {
			scheduleByTime[time] = [];
		}
		scheduleByTime[time].push(item);
	});

	const pad = n => n.toString().padStart(2, "0");
	const getTime24 = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

	// go through each time in 5-min increments for this location
	while (dateObj <= endDateLocObj) {
		const timeSlot = document.createElement("div");
		locationCol.appendChild(timeSlot);
		timeSlot.classList.add("time-slot");
		// const time24 = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
		const time24 = getTime24(dateObj);

		// get events happening at this time
		const thisTimeEvents = scheduleByTime[time24] || [];

		// add scheduled events as slotItems
		thisTimeEvents.forEach(event => {

			const slotItem = buildEvent(startDate, event, favourites, heardList);
			timeSlot.appendChild(slotItem);
			
			// Add event listeners for dynamically added favourites
			if (isFavouriteColumn) {
				if (isMobile()) {
					// only want this for mobile where we don't have hover tips
					const artistLinks = slotItem.querySelectorAll("a.artistLink");
					artistLinks.forEach((link) => {
						document.addEventListener('click', showTip);
					});
				} else {
					slotItem.addEventListener('mouseover', showTip);
					slotItem.addEventListener('mouseout', hideTip);
				}

			}
			if (locationColFavouritesDiv === null) {
				const locationElement = slotItem.querySelector(".location");
				locationElement.classList.add("hide");
			}
		});

		// Add five minutes to the Date object
		dateObj.setMinutes(dateObj.getMinutes() + 5);
	}
	
	return locationCol;
}

function initializeCurrentDay() {
    const lastView = JSON.parse(localStorage.getItem("lastView")) || {};
    var dateHeader;
	if (lastView.date) {
		// found stored value. go to last view
        dateHeader = document.getElementById(lastView.date);
	}
	if (dateHeader) {
		console.log("loading previous date view " + lastView.date);
		changeCurrentDay(dateHeader);
    } else {
		console.log("no valid date view saved. trying to jump to current time.");
		// pick the best day: either the first day of the schedule, or today's date if it matches
		if (jumpToCurrentTime() < 1) {
			// outside of schedule days. Choose the first date
			dateHeader = document.querySelector("#header div.date");
			console.log("going to first day");
			changeCurrentDay(dateHeader);
		}
    }
}

function closeAbout(event) {
	console.log("close about");
	var aboutSection = document.getElementById('about-section');
	var aboutBox = document.querySelector('div.aboutBox');

	if (aboutBox && !aboutBox.contains(event.target)) {
		// Click occurred outside the artistListSection
		aboutSection.classList.toggle('hide');
		document.removeEventListener('click', closeAbout);
	}
		event.stopImmediatePropagation();
}

function closeArtistListing(event) {
	console.log("artist listing event");
	var artistListSection = document.getElementById('artistList-section');
	var artistList = document.querySelector('#artistTable_wrapper');

	if (artistList && !artistList.contains(event.target)) {
		// Click occurred outside the artistListSection
		console.log("close artist listing");
		artistListSection.classList.toggle('hide');
		document.removeEventListener('click', closeArtistListing);
		event.stopImmediatePropagation();
		highlightFollowedArtists();
	}
}

function showArtistList() {
	const artistListSection = document.getElementById("artistList-section");
	// fillArtistDataTable();
	artistListSection.classList.toggle('hide');
	drawArtistDataTable();
	document.addEventListener('click', closeArtistListing);
}


function closeFood(event) {
	console.log("food event");
	var foodSection = document.getElementById('food-section');

	if (foodSection) {
		// Click occurred outside the artistListSection
		console.log("close food");
		foodSection.classList.toggle('hide');
		document.removeEventListener('click', closeFood);
		event.stopImmediatePropagation();
	}
}

function showFood() {
	const foodSection = document.getElementById("food-section");
	foodSection.classList.toggle('hide');
	document.addEventListener('click', closeFood);	
}

function handleHeaderClick(event) {
	console.log("handleHeaderClick");
	event.preventDefault();

	const element = event.target;
	const currDate = element.closest("div.date");
	
	if (currDate) {
		// Handle changing dates
		changeCurrentDay(currDate);
	} else {
		// not a date (e.g. Now, Artists, About)
		const headerElem = element.parentElement;
		console.log(headerElem.id);
		if (headerElem.id == "nowHeader") {
			jumpToCurrentTime();
		} else if (headerElem.id == "artistsHeader") {
			event.stopImmediatePropagation();
			showArtistList();
		} else if (headerElem.id == "foodHeader") {
			event.stopImmediatePropagation();
			showFood();
		} else if (headerElem.id == "aboutHeader") {
			const aboutSection = document.getElementById("about-section");
			aboutSection.classList.toggle('hide');
			event.stopImmediatePropagation();
			document.addEventListener('click', closeAbout);
		}
	}
}

function populateHeader(headerSection, dateObj) {
	// add to header
	// Get the day of the week in short form (e.g., "Mon", "Tue", etc.)
	const dayOfWeekShort = dateObj.toLocaleDateString("en-US", { weekday: "short" });
	// Get the date in the format "Aug 3"
	const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	const dateHeader = document.createElement("div");
	dateHeader.classList.add("date");
	const id = utils.getISODate(dateObj);
	dateHeader.id = id;
	dateHeader.innerHTML = `<a href="#" title="${formattedDate}" class="date">${dayOfWeekShort}<br /><span class="date">${formattedDate}</span>`;
	headerSection.appendChild(dateHeader);
}

function exportLocalStorageToLink() {
    const url = utils.getCompressedShareableURL();
    navigator.clipboard.writeText(url).then(() => {
        alert("Copied share URL to clipboard!");
    });
}

function exportLocalStorageToFile() {
	console.log("exportLocalStorageToFile");
	var filename = "";
	if (appmode["fringe"]) {
		filename = 'fringe';
	} else if (appmode["efmf"]) {
		filename = 'efmf';
	} else if (appmode["cfmf"]) {
		filename = 'cfmf';
	}
	
	utils.exportLocalStorageToFile(filename + (new Date()).getFullYear().toString() + 'schedule.json');
}

async function populateScheduleDay(startDate, daySchedule, headerSection, scheduleSection, progress) {
	const buildingStatus = document.getElementById("buildingday");
	const morningDate = new Date("1970-01-01T04:00:00-06:00");
	
	const dayScheduleArray = Object.values(daySchedule.schedule);
	const startTimes = utils.getSortedUniqueField(dayScheduleArray, "startTime");
	const endTimes = utils.getSortedUniqueField(dayScheduleArray, "endTime");
	const startTime = startTimes[0];
	const endTime = endTimes.slice(-1);

	const dateObj = new Date(`${startDate}T${startTime}-06:00`);
	const startDateObj = new Date(`${startDate}T${startTime}-06:00`);
	
	const status = "[" + (progress) + "%] Loading " + utils.getISODate(startDateObj);
	console.log(status);
	buildingStatus.textContent = status;
	
	// handle date rollover
	const endDateTestObj = new Date(`1970-01-01T${endTime}-06:00`);
	let endDateObj = new Date(`${startDate}T${endTime}-06:00`);
	if (endDateTestObj < morningDate) {
		// it's a new day
		endDateObj.setDate(endDateObj.getDate() + 1);
	}

	// add a bit to the end of the day
	endDateObj.setMinutes(endDateObj.getMinutes() + 15);

	// add top header date
	populateHeader(headerSection, dateObj);

	// create schedule container
	const schedule = document.createElement("div");
	schedule.classList.add("schedule", "slide-off-right", "hide");
	schedule.id = "schedule-" + utils.getISODate(dateObj);
	const timeHeader = document.createElement("div");
	timeHeader.classList.add("location-column", "time-header");
	schedule.appendChild(timeHeader);

	buildTimeColumn(timeHeader, dateObj, endDateObj);

	// populate favourites column
	const favouritesCol = buildEventsForLocation(-1, startDate, startDateObj.getTime(), dayScheduleArray, true);
	schedule.appendChild(favouritesCol);

	// populate each location column
	const showLocations = utils.getSortedUniqueField(dayScheduleArray, "locationId");
	// Retrieve and sort the keys of the dictionary
	const sortedLocations = utils.getSortedUniqueFieldFromDict(locationData, 'locationId');

	sortedLocations.forEach(locationId => {
		const location = locationData[locationId];
		if (showLocations.includes(locationId)) {
			const locationCol = buildEventsForLocation(locationId, startDate, startDateObj.getTime(), dayScheduleArray, false);
			schedule.appendChild(locationCol);
		}
	});
	
	// schedule.style.minWidth = Math.round(100 * locations.length/3).toString() + "vw";
	schedule.style.minWidth = `max(80vw, calc(var(--column-max-width) * ( ${showLocations.length} + 2 )))`;
	schedule.style.maxWidth = `max(80vw, calc(var(--column-max-width) * ( ${showLocations.length} + 2 )))`;

	scheduleSection.appendChild(schedule);
	//schedule.offsetWidth;	
}

// Function to dynamically populate the schedule section with the ability to select favourites
async function populateSchedule() {
	if (appmode["fringe"]) {
		availabilityDict = await utils.fetchJsonData("availability.json");
	}
	artistsData = await populateArtists(); // Wait until populateArtists() is finished
	locationData = await populateLocations();
	scheduleData = await utils.fetchJsonData("schedule.json");

	mergedScheduleArray = mergeSchedules();
    const favourites = utils.getFavourites();
    const aboutSection = document.getElementById("about-section");
    const headerSection = document.getElementById("header");
    const scheduleSection = document.getElementById("schedule-section");

	const artistsHeader = document.createElement("div");
	const headerListName = (appmode["fringe"]) ? "Shows" : "Artists";
	
	artistsHeader.innerHTML = `<div id="artistsHeader"><a title="Show List" href="" class="artists">${headerListName}</a></div>`;

	const aboutHeader = document.createElement("div");
	const aboutHeaderDiv = document.createElement("div");
	aboutHeaderDiv.id = "aboutHeader";
	const aboutLink = document.createElement("a");
	aboutLink.href = "#about";
	aboutLink.id = "aboutLink";
	aboutLink.classList.add("about");
	aboutLink.textContent = "About";
	aboutHeaderDiv.appendChild(aboutLink);
	aboutHeader.appendChild(aboutHeaderDiv);

	if (appmode["fringe"]) {
		headerSection.appendChild(artistsHeader);
		headerSection.appendChild(aboutHeader);
	}
	/*	
	const startDates = Object.keys(scheduleData).sort();
	*/

	// update style ".header div" "width": 100/length(startDates) vh
	document.documentElement.style.setProperty("--header-div-date-width", Math.round(100 / (Object.keys(scheduleData).length + 2)).toString() + "vw");


	var day = 0;
	const entries = Object.entries(scheduleData);
	// for each day
	Object.entries(scheduleData).forEach(([startDate, daySchedule], index) => {
		if (day == 0) {
			populateScheduleDay(startDate, daySchedule, headerSection, scheduleSection, (100 * index / (entries.length - 1)));
			const dateHeader = document.querySelector("#header div.date");
			console.log("going to first day");
			changeCurrentDay(dateHeader, true);
			initScrollables();
			const headerDateLinks = document.querySelectorAll('div#header div a');
			headerDateLinks.forEach((element) => {
				element.addEventListener('click', handleHeaderClick);
			});
		} else {
			setTimeout( () => {
				// requestAnimationFrame(() => {
					populateScheduleDay(startDate, daySchedule, headerSection, scheduleSection, (100 * index / (entries.length - 1)));
					const isLast = index === entries.length - 1;
					if (isLast) { 
						if (!appmode["fringe"]) {
							headerSection.appendChild(artistsHeader);
							const foodHeader = document.createElement("div");
							foodHeader.innerHTML = `<div id="foodHeader"><a title="Food Menus" href="" class="food">Food Menu</a></div>`;
							headerSection.appendChild(foodHeader);
							headerSection.appendChild(aboutHeader);
						}

						document.getElementById("loadingStatus").classList.add("hide"); 


						const headerDateLinks = document.querySelectorAll('div#header div a');
						headerDateLinks.forEach((element) => {
							element.addEventListener('click', handleHeaderClick);
						});

						// jump to last saved day, or current day, or if today isn't one of the days, then jump to first day
						initializeCurrentDay();

						initScrollables();
						
						const allSchedules = document.querySelectorAll('div.schedule');
						allSchedules.forEach((schedule) => {
							schedule.addEventListener('animationend', checkOverlap);
						});

						// Add event listeners for mouseover and mouseout (desktop) and touchstart and touchend (mobile) to all elements with data-tip
						if (! isMobile()) {
							const elementsWithTip = document.querySelectorAll('[data-tip]');
							elementsWithTip.forEach((element) => {
								element.addEventListener('mouseover', showTip);
								element.addEventListener('mouseout', hideTip);
							});
						} else {
							// on mobile, don't add tips to links
							const elementsWithTip = document.querySelectorAll('[data-tip]:not(a)');
							elementsWithTip.forEach((element) => {
								element.addEventListener('touchstart', showTip);
								element.addEventListener('touchend', hideTip);
							});
						}

					}
				// });
			}, 0*(1000+ (2000 * day)));
		}
		day += 1;
	});


	setTimeout(() => {
		initArtistListing();
		initArtistTips();
		enableStarClick();
		// Add event listeners for mouseover and mouseout (desktop) and touchstart and touchend (mobile) to all elements with data-tip
		if (! isMobile()) {
			const elementsWithTip = document.querySelectorAll('[data-tip]');
			elementsWithTip.forEach((element) => {
				element.addEventListener('mouseover', showTip);
				element.addEventListener('mouseout', hideTip);
			});
		} else {
			// on mobile, don't add tips to links
			const elementsWithTip = document.querySelectorAll('[data-tip]:not(a)');
			elementsWithTip.forEach((element) => {
				element.addEventListener('touchstart', showTip);
				element.addEventListener('touchend', hideTip);
			});
		}
	}, 200);

	setTimeout(() => {
		fillArtistSection(artistsData);
	}, 400);
	
	// About page
	const aboutContainer = document.createElement("div");
	aboutContainer.classList.add("aboutContainer");
	aboutSection.appendChild(aboutContainer);

	const about = document.createElement("div");
	about.classList.add("aboutBox");
	let aboutHtml = '';
	aboutHtml += '<div class="aboutImg"><img alt="Music Festival Schedule Logo" src="./favicon.png" /></div><h3>Questions & e-transfer donations:</h3><p><a href="mailto:yamyam@yamyam.ca" class="contact">yamyam@yamyam.ca</a></p><p>Not affiliated with any organization. This is not an official app and no assurances are made about the accuracy of the content.</p><p>Official website';
	if (appmode["fringe"]) {
		aboutHtml += ': <a class="aboutLink" target="_blank" href="https://www.fringetheatre.ca/festival/how-to-fringe/">https://www.fringetheatre.ca/festival/how-to-fringe/</a>';
	} else if (appmode["efmf"]) {
		aboutHtml += ' FAQ: <a class="aboutLink" target="_blank" href="https://edmontonfolkfest.org/faq/">https://edmontonfolkfest.org/faq/</a>';
	} else if (appmode["cfmf"]) {
		aboutHtml += ' FAQ: <a class="aboutLink" target="_blank" href="https://calgaryfolkfest.com/folk-fest/faq">https://calgaryfolkfest.com/folk-fest/faq</a>';
	}	
	aboutHtml += '</p><p>No data is collected or transmitted by this app (which is why your settings don&rsquo;t transfer between devices). You can manually transfer your schedule using the buttons below.</p>';
	aboutHtml += '<div class="export"><p><button id="exportButton">Export schedule</button> <button id="exportLink">(copy link)</p></div>';
	aboutHtml += '<div class="import"><p><label for="fileInput" class="file-upload"><span>Import schedule</span><input type="file" id="fileInput" accept=".json"></label></p></div>';
	about.innerHTML = aboutHtml;
	aboutContainer.appendChild(about);

	const exportButton = document.getElementById('exportButton');
	const exportLink = document.getElementById('exportLink');
	const fileInput = document.getElementById('fileInput');

	if (exportButton) {
		exportButton.addEventListener('click', exportLocalStorageToFile);
	} else {
		console.error('Export button not found.');
	}
	if (exportLink) {
		exportLink.addEventListener('click', exportLocalStorageToLink);
	} else {
		console.error('Export link button not found.');
	}
	
	if (fileInput) {
		fileInput.addEventListener('change', function() {
			utils.importLocalStorageFromFile(fileInput);
		});
	} else {
		console.error('File input not found.');
	}

}
/**
 * Converts one event’s JSON into the structure we want
 * and merges it into availabilityDict.
 *
 * @param {Object} json – the object returned by eventProxy.php
 */
function updateAvailabilityDict(json) {
	console.log(`Returned json ${JSON.stringify(json)}`);

	for (const eventKey in json) {
		if (!Number.isInteger(Number(eventKey))) continue;
		
		console.log(`Retrieved ${eventKey}. isCached: ${json.cached}`);
		// Ensure a slot exists for this event
		if (!availabilityDict[eventKey]) {
			availabilityDict[eventKey] = {};
		}

		const performances = json[eventKey];

		for (const performanceId in performances) {
			availabilityDict[eventKey][performanceId] = performances[performanceId];
			console.log(`Updated availability for event ${performanceId}: ${performances[performanceId]}`);
		}

		// update the datatable row
		findAndUpdateArtistDataTableRow(eventKey);

	}

    // Debug: see the latest snapshot
	// console.log(availabilityDict[eventKey]);
    // console.log('Full availabilityDict is now:', availabilityDict);
	
}

/**
 * Fetches (or refreshes) one event and updates the dictionary.
 * Re-uses the secure server-side cache in eventProxy.php.
 *
 * @param {string|number} eventId – numeric part only, e.g. 6629
 */
function loadEvent(eventId) {
	if (!appmode["fringe"]) return;

	// this was the max for 2025, need to update it
	if (eventId > 6770) return;

	console.log(`Fetch /event.php?eventId=${eventId}`)
    $.getJSON(`/event.php?eventId=${eventId}`)
        .done(updateAvailabilityDict)
        .fail((jqXHR, textStatus, err) => {
            console.error(`Failed to load event ${eventId}:`, err);
			// this was for full manual refresh. dangerous
			// loadEvent(parseInt(eventId) + 1);
			});
}


///////////////////////////////////////////////////////////////////////////////////
// DISPLAY INTERFACE FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function highlightFollowedArtists() {
	const following = utils.getFollowing(); // e.g., { "6633": true, "7921": true }

	// Get all artist links once
	const allArtistLinks = document.querySelectorAll("a.artistLink[data-artistid]");

	// Track which cards have followed artists
	const cardsWithFollowedArtists = new Set();

	allArtistLinks.forEach(link => {
		const artistId = link.getAttribute("data-artistid");
		const isFollowed = !!following[artistId]; // direct lookup
		const eventCard = link.closest(".schedule-item");

		if (isFollowed) {
			link.classList.add("glow");
			if (eventCard) {
				cardsWithFollowedArtists.add(eventCard);
			}
		} else {
			if (link.classList.contains("glow")) {
				link.classList.remove("glow");
			}
		}
	});

	// Update all cards: add/remove "following" class
	document.querySelectorAll(".schedule-item").forEach(card => {
		if (cardsWithFollowedArtists.has(card)) {
			card.classList.add("following");
		} else {
			card.classList.remove("following");
		}
	});
}

function highlightFollowedArtist(artist) {
	// run through all the places where an artist is linked (in the event cards) and highlight the artist name,
	// or remove the highlight if they're no longer being followed
	const following = utils.getFollowing();
	const isFollowed = utils.isFollowing(following, artist.slug);
	const selector = `a.artistLink[data-artistid='${artist.slug}']`;
	const artistLinks = document.querySelectorAll(selector);

	artistLinks.forEach((link) => {
		const eventCard = link.closest(".schedule-item");
		if (isFollowed) {
			link.classList.add("glow");
			if (eventCard) {
				eventCard.classList.add("following");
			}
		} else if (link.classList.contains("glow")) {
			// we were following this artist, but aren't any longer, but the link is still glowing
			link.classList.remove("glow");
			if (eventCard) {
				// if no artist in this card is being followed anymore, remove the glow
				const eventArtistLinks = eventCard.querySelector('a.artistLink.glow');
				// if we're not following anyone else on this card, remove the card class
				if (!eventArtistLinks) eventCard.classList.remove("following");
			}
		}
	});
}

function toggleFollowArtist(artist, element) {
	console.log("toggle follow " + artist.name);
	element.classList.toggle('following');
	const following = element.classList.contains('following');
	utils.handleFollowingSelection(artist.slug, following);
	highlightFollowedArtist(artist);
}

function toggleHeardIt(event) {
	const starContainer = event.currentTarget.closest(".favouriteContainer");
	const heard = ! starContainer.classList.contains('heard');

	if (heard) {
		starContainer.classList.remove('unheard');
		starContainer.classList.add('heard');
	} else {
		starContainer.classList.remove('heard');
		starContainer.classList.add('unheard');
	}

	const favouriteId = starContainer.dataset.favouriteId;
	utils.handleHeardSelection(favouriteId, heard);

	if ( ! starContainer.closest(".scheduleList")) {
		const schedule = starContainer.closest("div.schedule");
		if (! starContainer.closest(".favourites")) {
			// We have toggled a "heard" outside of the favourites column
			// Update favourite column, if it's there
			const favouritesCol = schedule.querySelector(".location-column.favourites");
			const favouriteContainer = favouritesCol.querySelector(`.favouriteContainer[data-favourite-id='${favouriteId}']`);
			if (favouriteContainer) {
				favouriteContainer.classList.toggle('unheard');
				favouriteContainer.classList.toggle('heard');
			}
		} else {
			// We have toggled a star inside the favourites
			const nonFavouriteSchedule = schedule.querySelectorAll(`.location-column:not(.favourites)`);
			nonFavouriteSchedule.forEach((location) => {
				const otherContainer = location.querySelector(`.favouriteContainer[data-favourite-id='${favouriteId}']`);
				if (otherContainer) {
					if (heard) {
						otherContainer.classList.remove('unheard');
						otherContainer.classList.add('heard');
					} else {
						otherContainer.classList.remove('heard');
						otherContainer.classList.add('unheard');
					}
				}
			});
		}
	} else {
		// redraw everything
		const schedules = document.querySelectorAll("div.schedule");
		schedules.forEach((schedule) => {
			const favouritesCol = schedule.querySelector(".location-column.favourites");
			const favouriteContainer = favouritesCol.querySelector(`.favouriteContainer[data-favourite-id='${favouriteId}']`);
			if (favouriteContainer) {
				favouriteContainer.classList.toggle('unheard');
				favouriteContainer.classList.toggle('heard');
			}

			const nonFavouriteSchedule = schedule.querySelectorAll(`.location-column:not(.favourites)`);
			nonFavouriteSchedule.forEach((location) => {
				const otherContainer = location.querySelector(`.favouriteContainer[data-favourite-id='${favouriteId}']`);
				if (otherContainer) {
					if (heard) {
						otherContainer.classList.remove('unheard');
						otherContainer.classList.add('heard');
					} else {
						otherContainer.classList.remove('heard');
						otherContainer.classList.add('unheard');
					}
				}
			});
		});
	}

	const scheduleEvent = getScheduleEvent(favouriteId);
	const artistList = getEventArtistList(scheduleEvent);
	artistList.forEach((artist) => {
		let change = (heard) ? 1 : -1;
		artist.heardCount += change;
		if (!appmode["fringe"]) {
			report.menHeard += artist.men * change;
			report.notMenHeard += artist.notMen * change;
		}
	});

	// update the datatable row
	findAndUpdateArtistDataTableRow(starContainer.dataset.slugId);
	updateGenderReport();
}

function toggleStar(event) {
	const starContainer = event.currentTarget.closest(".favouriteContainer");
	starContainer.classList.toggle('favouriteOn');
	starContainer.classList.toggle('favouriteOff');

	const favourite = starContainer.classList.contains('favouriteOn');
	const favouriteId = starContainer.dataset.favouriteId;
	utils.handleFavouriteSelection(favouriteId, favourite);

	if ( ! starContainer.closest(".scheduleList")) {
		if (! starContainer.closest(".favourites")) {
			// We have toggled a favourite outside of the favourites column
			// Redraw and replace favourites column
			const schedule = starContainer.closest("div.schedule");
			const oldFavouritesCol = schedule.querySelector(".location-column.favourites");
			const startDate = oldFavouritesCol.dataset.startDate;
			// const filteredSchedule = scheduleData.filter(item => item.startDate === startDate); 
			const dayScheduleArray = Object.values(scheduleData[startDate].schedule);
			const favouritesCol = buildEventsForLocation(-1, startDate, parseInt(oldFavouritesCol.dataset.startTime), dayScheduleArray, true);
			oldFavouritesCol.replaceWith(favouritesCol);
			checkOverlap();
		} else {
			// We have toggled a star inside the favourites
			// Remove it from the favourites column and also toggle the
			// starred item in the main schedule
			const schedule = starContainer.closest("div.schedule");
			const eventCard = schedule.querySelector(`div.location-column:not(.favourites) div.favouriteContainer[data-favourite-id="${favouriteId}"]`);
			eventCard.classList.toggle('favouriteOn');
			eventCard.classList.toggle('favouriteOff');
			
			starContainer.remove();
		}
	} else {
		// we clicked on the artist card or datatable rather than on the big schedule. redraw everything
		const schedules = document.querySelectorAll("div.schedule");
		schedules.forEach((schedule) => {
			const oldFavouritesCol = schedule.querySelector(".location-column.favourites");
			const startDate = oldFavouritesCol.dataset.startDate;
			const filteredSchedule = mergedScheduleArray.filter(item => item.startDate === startDate); 
			//const dayScheduleArray = Object.values(scheduleData[startDate].schedule);
			const favouritesCol = buildEventsForLocation(-1, startDate, parseInt(oldFavouritesCol.dataset.startTime), filteredSchedule, true);
			oldFavouritesCol.replaceWith(favouritesCol);
			checkOverlap();

			// remove any inside favourites
			const eventCard = schedule.querySelector(`div.location-column:not(.favourites) div.favouriteContainer[data-favourite-id="${favouriteId}"]`);
			if (eventCard) {
				eventCard.classList.toggle('favouriteOn');
				eventCard.classList.toggle('favouriteOff');
			}
		});
	}

	const scheduleEvent = getScheduleEvent(favouriteId);
	const artistList = getEventArtistList(scheduleEvent);
	artistList.forEach((artist) => {
		let change = (favourite) ? 1 : -1;
		artist.starredCount += change;
		if (!appmode["fringe"]) {
			report.menInStarredEvents += artist.men * change;
			report.notMenInStarredEvents += artist.notMen * change;
		}
	});

	// update the datatable row
	findAndUpdateArtistDataTableRow(starContainer.dataset.slugId);
	updateGenderReport();
}


function enableStarClick() {
	// we have to wait until we create the stars to add the listeners
	// this is nothing: just a reminder why we don't do anything here
	
/*
	const stars = document.querySelectorAll('div.favouriteStar');
	stars.forEach((star) => {
		star.addEventListener('mousedown', handleStarMouseDown);
		star.addEventListener('mouseup', handleStarMouseUp);
	});
	*/
}


// const tipPopup = document.getElementById('tipPopup');


///////////////////////////////////////////////////////////////////////////////////
// INITIALIZATION ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// Call the functions to populate the UI on page load
window.addEventListener("load", () => {
    setTimeout(() => { populateSchedule(); }, 10);
});

// Register the service worker for offline capabilities
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(registration => {
                console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch(error => {
                console.error("Service Worker registration failed:", error);
            });
    });
}

const loadingOptions = {
    root: null, // Use the viewport as the root
    rootMargin: '0px', // Margin around the root
    threshold: 0.1 // Percentage of element visibility required to trigger loading
};

/*
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load the delayed section
			entry.target.src = entry.target.dataset.src;
            observer.unobserve(entry.target);
        }
    });
}, loadingOptions);

const delayedSection = document.querySelector('#food-section');
const delayedImages = delayedSection.querySelectorAll('img');
delayedImages.forEach((delayedImage) => {
	observer.observe(delayedImage);
});
*/




///////////////////////////////////////////////////////////////////////////////////
// PWA SUPPORT FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

export function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

var PWAisInstalled = false;

// Check if the user is on iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Check if the user is using Safari on iOS
function isSafariOnIOS() {
  return isIOS() && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") && !navigator.userAgent.includes("CriOS");
}

// Check if the user is on Android
function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

// Check if the user is using Chrome on Android
function isChromeOnAndroid() {
  return isAndroid() && /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
}

function getPWADisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if (navigator.standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}

function closeInstalledStatus(event) {
	const installedStatus = document.getElementById('installedStatus');
	
	installedStatus.classList.add("hide");
}

async function getInstalledApps() {
	const relatedApps = await navigator.getInstalledRelatedApps();
	const installedStatus = document.getElementById('installedStatus');
	PWAisInstalled = relatedApps.length > 0;

	// PWA install instructions
	if ((getPWADisplayMode() == 'browser') && (!PWAisInstalled)) {
		if (isChromeOnAndroid()) {
			installedStatus.innerHTML = '<button id="install-button" label="Install to home screen" value="Install to home screen" raised="" onclick="installPrompt();">Install to home screen</button>';
			//installedStatus.addEventListener('click', closeInstalledStatus); 
			installedStatus.classList.remove("hide");
		} else if (isSafariOnIOS()) {
			installedStatus.innerHTML = '<p>For the best experience, please add this to your home screen. None of your data or device information is accessed, and no information whatsoever is collected or sent. ' +
										" You'll just have a faster, full-screen experience with less drain on battery and completely offline capability.</p>" +
										'<p>Click the share button <img src="./safari-share.png" alt="Safari Share" /> and choose "Add to Home Screen".</p><img src="./safari-add-to-home-screen.png" alt="Add to Home Screen" />';
			installedStatus.addEventListener('click', closeInstalledStatus); 
			installedStatus.classList.remove("hide");
		} else {
			// installedStatus.textContent = "Not installed. Not Android Chrome or iOS Safari now.";
		}
	} else {
		// installedStatus.textContent = "Installed.";
	}
}

if ('getInstalledRelatedApps' in navigator) {
  getInstalledApps();
}

var appIsActive = true;
var appInactiveTime = 0;

// Function to perform actions when the user returns to the app
function onAppReturn() {
  // This function will be called when the user returns to the app after being away for at least 30 minutes
  console.log("Welcome back to the app!");
  jumpToCurrentTime();
}

// Function to check app visibility and inactivity time
function checkAppVisibility() {
  if (document.hidden) {
    // App is inactive (tab switched or minimized)
    appIsActive = false;
    appInactiveTime = Date.now();
  } else {
    // App is visible and active
    const timeElapsed = Date.now() - appInactiveTime;
    if (!appIsActive && timeElapsed >= 30 * 60 * 1000) {
      // Call the function only if the app was inactive for at least 30 minutes
      onAppReturn();
    }
    appIsActive = true;
  }
}

// Add an event listener to the visibilitychange event
document.addEventListener("visibilitychange", checkAppVisibility);

// Call the checkAppVisibility() function on page load to set initial state
checkAppVisibility();

///////////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

// Check for overlap on page load and when the window is resized
window.addEventListener('resize', checkOverlap);

function countOverlaps(element, allElements) {
	let count = 0;
	const rectElement = element.getBoundingClientRect();

	for (const otherElement of allElements) {
		if (otherElement !== element) {
			const rectOther = otherElement.getBoundingClientRect();

			if (
				rectElement.top < rectOther.bottom &&
				rectElement.bottom > rectOther.top &&
				rectElement.left < rectOther.right &&
				rectElement.right > rectOther.left
			) {
				count++;
			}
		}
	}

	return count;
}


export function checkOverlap() {
	const scheduleItems = document.querySelectorAll('.schedule-item');

	for (const item of scheduleItems) {
		resetOverlapState(item);
	}

	// check all .schedule-items in !favourite div.location-column for overlap with each other
//	const locCols = document.querySelectorAll('div.location-column:not(.favourite)');
	const locCols = document.querySelectorAll('div.location-column');
	for (const locCol of locCols) {
		const scheduleItems = locCol.querySelectorAll('.schedule-item');

		for (const item of scheduleItems) {
			if (!item.dataset.overlap) {
				const overlappingCount = countOverlaps(item, scheduleItems);
				if (overlappingCount > 0) {
					item.dataset.overlap = overlappingCount;
					// console.log(overlappingCount);
				}
			}
		}

		for (let i = 0; i < scheduleItems.length; i++) {
			for (let j = i + 1; j < scheduleItems.length; j++) {
				checkAndStyleElementsOverlap(scheduleItems[i], scheduleItems[j]);
			}
		}
	}
}

function resetOverlapState(element) {
	if (element.dataset.rank) {
		delete element.style.position;
		delete element.style.zIndex;
		delete element.dataset.rank;
		delete element.dataset.overlap;
		delete element.style.left;
		delete element.style.maxWidth;
	}
}

function styleOverlappingElements(elementA, elementB) {
	if (elementA.style.position == "relative") return;

	// Element A is lower on the page and overlaps Element B, make Element B transparent and set higher z-index
	elementA.classList.add('transparent');
	elementB.classList.add('transparent');
/*
	elementB.style.zIndex = '2';
	elementA.style.zIndex = '1';
	*/
	if (!elementB.style.zIndex) {
		elementB.style.zIndex = '2';
	} else {
		elementB.style.zIndex = elementB.style.zIndex++;
	}
	if (! elementB.dataset.rank) {
		elementB.dataset.rank = "0";
	} else {
		elementB.dataset.rank = parseInt(elementB.dataset.rank) + 1;
	}		
	if (! elementA.dataset.rank) {
		elementA.dataset.rank = parseInt(elementB.dataset.rank) + 1;
	} else {
		elementA.dataset.rank = parseInt(elementA.dataset.rank) + 1;
	}
	
	const containerWidth = (elementA.parentElement.offsetWidth / (parseInt(elementA.dataset.overlap) + 1));
	elementA.style.maxWidth = containerWidth.toString() + "px";
	elementA.style.position = "relative";
	elementA.style.left = Math.min(elementA.parentElement.offsetWidth - containerWidth - elementA.offsetLeft, (Math.round((containerWidth) * 0.9 * (parseInt(elementA.dataset.rank))) - elementA.offsetLeft).toString()) + "px";

	elementB.style.maxWidth = containerWidth.toString() + "px";
}

function checkAndStyleElementsOverlap(elementA, elementB) {
	const rectA = elementA.getBoundingClientRect();
	const rectB = elementB.getBoundingClientRect();

	if (
		rectA.top < rectB.bottom &&
		rectA.bottom > rectB.top &&
		rectA.left < rectB.right &&
		rectA.right > rectB.left
	) {
		styleOverlappingElements(elementB, elementA);
	} else if (
		rectB.top < rectA.bottom &&
		rectB.bottom > rectA.top &&
		rectB.left < rectA.right &&
		rectB.right > rectA.left
	) {
		styleOverlappingElements(elementA, elementB);
	} else if (!(elementA.dataset.overlap || elementB.dataset.overlap)) {
		// No overlap, set both elements to their default state
		elementA.classList.remove('transparent');
		elementA.style.zIndex = '1';
		elementB.classList.remove('transparent');
		elementB.style.zIndex = '1';
		delete elementA.style.position;
		delete elementB.style.position;
		delete elementA.dataset.overlap;
		delete elementB.dataset.overlap;
	}
}
	

let pointerFromX = 0;
let elementFromX = 0;
let pointerFromY = 0;
let elementFromY = 0;

let pointerFromXHeader = 0;
let elementFromXHeader = 0;

function onDrag(event) {
  // Ensure we only do this for pointers that don't have native
  // drag-scrolling behavior and when the pointer is down.
  if (event.pointerType == 'mouse') {
	console.log("onDrag");
	event.preventDefault();
	const currDate = document.querySelector('.header div.current');	
	const currScheduleParent = document.getElementById("schedule-" + currDate.id).parentElement;
	const currSchedule = document.getElementById("schedule-" + currDate.id);
	const currCol = currSchedule.querySelector('.location-column.time-header');
    currScheduleParent.scrollLeft = elementFromX - event.clientX + pointerFromX;
	currScheduleParent.scrollTop =  elementFromY - event.clientY + pointerFromY;
  }
}

function onDragHeader(event) {
  // Ensure we only do this for pointers that don't have native
  // drag-scrolling behavior and when the pointer is down.
  if (event.pointerType == 'mouse') {
	console.log("onDragHeader");
	event.preventDefault();
	const scrollableHeader = document.querySelector('#header');
    scrollableHeader.scrollLeft = elementFromXHeader - event.clientX + pointerFromXHeader;
  }
}

export function initScrollables() {
	if (isMobile()) {
		return;
	}
	const scrollableHeader = document.querySelector('#header');
	const scrollables = document.querySelectorAll('div.schedule');

	scrollables.forEach((scrollable) => {
		scrollable.addEventListener('pointerdown', (event) => {
		  // Ensure we only do this for pointers that don't have native
		  // drag-scrolling behavior.
		  if (event.pointerType == 'mouse') {
			// Set the position where the mouse is starting to drag from.
			pointerFromX = event.clientX;
			// Set the position of the element is scrolled from.
			elementFromX = scrollable.parentElement.scrollLeft;

			pointerFromY = event.clientY;
			elementFromY = scrollable.parentElement.scrollTop;
			
			// React on pointer move.
			document.addEventListener('pointermove', onDrag);
		  }
		});
	});

	scrollableHeader.addEventListener('pointerdown', (event) => {
	  // Ensure we only do this for pointers that don't have native
	  // drag-scrolling behavior.
	  if (event.pointerType == 'mouse') {
		// Set the position where the mouse is starting to drag from.
		pointerFromXHeader = event.clientX;
		// Set the position of the element is scrolled from.
		elementFromXHeader = scrollableHeader.scrollLeft;

		// React on pointer move.
		document.addEventListener('pointermove', onDragHeader);
	  }
	});

	/*
	// not needed
	scrollable.addEventListener('pointerleave', (event) => {
	  if (event.pointerType == 'mouse') {
		// document.removeEventListener('pointermove', onDrag);
	  }
	});
	*/

	// Stop reacting on pointer move when pointer is no longer clicked.
	document.addEventListener('pointerup', (event) => {
	  // Ensure we only do this for pointers that don't have native
	  // drag-scrolling behavior.
	  if (event.pointerType == 'mouse') {
		document.removeEventListener('pointermove', onDrag);
		document.removeEventListener('pointermove', onDragHeader);
	  }
	});
}

/*
function viewportZoomInit() {
	// Get a reference to the viewport meta tag
	var viewportMeta = document.querySelector("meta[name=viewport]");

	// Store the default initial scale value
	var defaultScale = 1.0;

	// Add an event listener to the document for touchend events
	document.addEventListener("touchend", function(event) {
		// Get the current viewport scale
		var currentScale = parseFloat(viewportMeta.content.match(/initial-scale=([0-9\.]+)/)[1]);

		// Check if the current scale is less than the default scale
		if (currentScale < defaultScale) {
			// Apply the animation class
			viewportMeta.classList.add("meta-viewport-animate");

			// Set the viewport scale to the default value
			viewportMeta.content = "width=device-width, initial-scale=" + defaultScale;

			// Remove the animation class after the animation completes
			setTimeout(function() {
				viewportMeta.classList.remove("meta-viewport-animate");
			}, 300); // Adjust the timeout duration to match the animation duration
		}
	});
}
*/


// Function to jump to the current time in the schedule
// Note that this function assumes the time slots are in 1-hour increments,
// and the time slots have a time string in the format "HH:mm" (e.g., "09:00", "13:30")
export function jumpToCurrentTime() {
	const now = new Date();
	console.log("trying to jump to current time");
	// switch to current day
	const todayStr = utils.getISODate(now);
	const dateHeader = document.getElementById(todayStr);

	if (! dateHeader) {
		// out of date range
		console.log("current date outside of range");
		const firstDateDiv = document.querySelector('div.date');
		const allDateDivs = document.querySelectorAll('div.date');
		const lastDateDiv = allDateDivs[allDateDivs.length - 1]; // or .at(-1) in modern browsers

		if (new Date(todayStr) < new Date(firstDateDiv.id)) {
			changeCurrentDay(firstDateDiv);
		} else {
			changeCurrentDay(lastDateDiv);
		}
		return;
	}

	changeCurrentDay(dateHeader);


	// jump to current time
	var hours = now.getHours();
	var minutes = now.getMinutes();

	// bump back an hour
	if (hours > 0) {
		hours -= 1;
		/*
		if (minutes < 30) {
			minutes += 30;
			hours -= 1;
		} else {
			minutes -= 30;
		}
		*/
	} 
	// round minutes down to nearest multiple of 5
	minutes = Math.floor(minutes / 5) * 5;

	const currentTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	const schedule = document.querySelector(`#schedule-${todayStr}`);
	var currentTimeSlot = schedule.querySelector(`div.time-header .time-slot[data-time='${currentTimeString}']`);
	if (!currentTimeSlot) {
		const realHours = now.getHours();
		var realMinutes = now.getMinutes();
		realMinutes = Math.floor(minutes / 5) * 5;
		currentTimeSlot = schedule.querySelector(`div.time-header .time-slot[data-time='${realHours.toString().padStart(2, '0')}:${realMinutes.toString().padStart(2, '0')}']`);
		if (!currentTimeSlot) {
			currentTimeSlot = schedule.querySelector(`div.time-header .time-slot[data-time='${realHours.toString().padStart(2, '0')}:${(5+realMinutes).toString().padStart(2, '0')}']`);
		}
	}
	if (currentTimeSlot) {
		const dayColumn = currentTimeSlot.parentElement;
		scrollToElement(currentTimeSlot, schedule);
		// schedule.scrollLeft = dayColumn.offsetLeft - (schedule.clientWidth / 2) + currentTimeSlot.offsetLeft;
	}
	return true;
}


// make current date visible #schedule-yyyy-MM-dd
// jump down to current time #schedule-yyyy-MM-dd time-slot[data-time hh:mm] 
function scrollToElement(targetElement, container) {  
  if (targetElement && container) {
	// container.parentElement.scrollTop = Math.max(0, targetElement.offsetTop + 100);
	const scrollLoc = Math.max(0, targetElement.offsetTop + 100);
	container.parentElement.scrollTo({
		top: scrollLoc,
		behavior: 'smooth'
	});
  }
}

// Don't toggle stars if the user was actually just trying to drag
let starStartX = 0;
let starStartY = 0;

export function handleStarMouseDown(event) {
	starStartX = event.clientX;
	starStartY = event.clientY;
}

// This is called on the dedicated container of the item that was clicked rather than element itself
export function handleStarMouseUp(event) {
	const endX = event.clientX;
	const endY = event.clientY;

	const distance = Math.sqrt((endX - starStartX) ** 2 + (endY - starStartY) ** 2);
	// console.log(distance);
	if (distance <= 25) {
		if (event.currentTarget.classList.contains("favouriteStar") || event.currentTarget.classList.contains("scheduleStar")) {
			toggleStar(event);
		} else if (event.currentTarget.classList.contains("heardItStar") || event.currentTarget.classList.contains("scheduleHeard")) {
			toggleHeardIt(event);
		}
	}
}

// Switch schedules to a different day, and handle saving viewed date to storage
export function changeCurrentDay(currDate, noSave = false) {
	// Handle changing dates
	const prevDate = document.querySelector('.header div.current');
	const dateStr = currDate.id;
	console.log(dateStr);

	if (prevDate == currDate) {
		// do nothing: we're not changing date
		return;
	}

	const currDateObj = new Date(currDate.id);
	const currSchedule = document.getElementById("schedule-" + currDate.id);

	if (prevDate) {
		prevDate.classList.remove("current");

		// scroll off old schedule
		const prevDateObj = new Date(prevDate.id);
		const prevSchedule = document.getElementById("schedule-" + prevDate.id);
		
		prevSchedule.classList.remove("slide-on-from-left", "slide-on-from-right");
		currSchedule.classList.remove("slide-off-left", "slide-off-right", "hide");
		if (prevDateObj < currDateObj) {
			// was on an older date. scroll schedules left
			prevSchedule.classList.add("slide-off-left", "hide");
			currSchedule.classList.add("slide-on-from-right");
		} else {
			// was on a more recent date, now looking at an older date. scroll schedules right.
			prevSchedule.classList.add("slide-off-right", "hide");
			currSchedule.classList.add("slide-on-from-left");
		}
	} else {
		// just unhide the schedule
		currSchedule.classList.remove("slide-on-from-left", "slide-on-from-right", "hide");
		currSchedule.classList.add("slide-on-from-right");
	}
	currDate.classList.add("current");

	if (! noSave) {
		// update stored view settings
		const lastView = JSON.parse(localStorage.getItem("lastView")) || {};
		lastView.date = currDate.id;
		console.log("storing date view " + lastView.date);
		localStorage.setItem("lastView", JSON.stringify(lastView));
	}

	// resize overlapping events (they need to be in view before their sizes can be properly calculated)
	checkOverlap();
}


// Function to show the tip popup
export function showTip(event) {
    const tip = event.target.getAttribute('data-tip');
	const artistId = event.target.getAttribute('data-artistId');
	const tipPopup = document.getElementById('artist-' + artistId) ?? document.getElementById('tipPopup');
	//const tip = (artistId) ? document.getElementById('artist-' + artistId) : event.target.getAttribute('data-tip');
	
    if (tip) {
		if (isMobile()) {
			if (appmode["fringe"]) {
				// FRINGE: trigger update tickets
				if ( artistId ) {
					openArtistRow(artistsData[artistId]);
				}
			}
			// tap anywhere to hide tip
			document.addEventListener('click', hideTip);
		}

		if ( artistId ) {
			const targetElement = document.getElementById('artist-' + artistId);
			if (targetElement) {
				// tipPopup.innerHTML = targetElement.innerHTML;
				const scheduleFlags = tipPopup.querySelectorAll('.scheduleList');
				scheduleFlags.forEach((scheduleFlag) => {
					scheduleFlag.addEventListener('mousedown', handleStarMouseDown);
					scheduleFlag.addEventListener('mouseup', handleStarMouseUp);
				});
				const followFlags = tipPopup.querySelectorAll('.dt-followArtist');
				followFlags.forEach((flag) => {
					flag.addEventListener('click', toggleFollowArtistHandler);
				});

			}
		} else {
			tipPopup.innerHTML = tip;
		}

		// turn on display for calculations
		tipPopup.classList.add("popupDisplay");
		
		// Calculate the appropriate position for the popup

		var contactX = event.pageX;
		var contactY = event.pageY;
		if (isMobile()) {
			if (event.changedTouches) {
				contactX = event.changedTouches[0].clientX;
				contactY = event.changedTouches[0].clientY;
			}
		}
		 // Check if the target element is close to the bottom of the viewport
		const distanceToBottom = window.outerHeight - contactY;
		const popupHeight = tipPopup.clientHeight + 200;
		if (distanceToBottom < popupHeight + 20) {
			tipPopup.style.top = Math.max(60, Math.min(window.outerHeight - popupHeight - 200,(contactY + 10))) + 'px';
		} else {
			tipPopup.style.top = (contactY + 10) + 'px';
		}

		 // Check if the target element is close to the right side of the viewport
		const distanceToRightSide = window.outerWidth - contactX;
		const popupWidth = tipPopup.clientWidth;
		tipPopup.style.left = (contactX + 20) + 'px';
		if (window.outerWidth <= 1000) {
			if (isMobile()) {
				tipPopup.style.left = '30px';
			} else {
				if (distanceToRightSide < (window.outerWidth * 0.45)) {
					tipPopup.style.left = Math.max(contactX - window.outerWidth * 0.45 - 40, 30) + 'px';
				}
			}
		} else {
			if (distanceToRightSide < (window.outerWidth * 0.25)) {
				tipPopup.style.left = Math.max(contactX - window.outerWidth * 0.25 - 40, 100) + 'px';
			}
		}
	}
}

// Function to hide the tip popup
export function hideTip(event) {
	console.log("hideTip");
	if (event.target.classList.contains("scheduleList") || event.target.closest(".dt-followArtist") ) {
		// clicking on a star icon on mobile
		
		return;
	}
	const displayedTips = document.querySelectorAll('.popupDisplay');
	displayedTips.forEach((displayedTip) => {
		displayedTip.classList.remove("popupDisplay");
	});

	document.removeEventListener('click', hideTip);
	// event.stopImmediatePropagation();
}


function jumpToArtist(event) {
	console.log("jumpToArtist");
	const link = event.target;
	if (link.classList.contains('artistLink')) {
		event.preventDefault();
		// console.log(new Date());
		showArtistList();
		// console.log(new Date());
		const artistTable = document.getElementById('artistTable');
		const artistDataTable = $('#artistTable').DataTable();
		// get the artist
		const artistId = link.dataset.artistid;
		const artist = artistsData[artistId];
		// jump to artist in artist listing
		const searchString = (appmode["fringe"] ? artist.slug : artist.name);
		artistDataTable.search(searchString).draw();
		// console.log(new Date());
		artistTable.querySelector('td.dt-control').click();
		// console.log(new Date());
	}
	
}

function initArtistTips() {
	if (isMobile()) {
		// only want this for mobile where we don't have hover tips
		const artistLinks = document.querySelectorAll("a.artistLink");
		artistLinks.forEach((link) => {
			document.addEventListener('click', showTip);
		});
		const popup = document.querySelector(".popup");
		popup.style.maxWidth = "90vw";
	} else {
		const artistLinks = document.querySelectorAll("a.artistLink");
		artistLinks.forEach((link) => {
			document.addEventListener('click', jumpToArtist);
		});
	}
}
