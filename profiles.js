var url, tab, currentDomain;
var origProfileTable = "";

// BEGIN DOMAIN FUNCTIONS //
function getHostName(url) {
	var match = url.match(/:\/\/(www[0-9]?\.)?(.[^\/:]+)/i);
	if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		return match[2];
	}
	else {
		return null;
	}
}
function getDomain(url) {
	var hostName = getHostName(url);
	var domain = url;

	if (hostName != null) {
		var parts = hostName.split('.').reverse();

		if (parts != null && parts.length > 1) {
			domain = parts[1] + '.' + parts[0];

			if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
				domain = parts[2] + '.' + domain;
			}
		}
	}
	return domain;
}
// END DOMAIN FUNCTIONS //


// BEGIN PROFILE FUNCTIONS //
function addProfileListeners() {
	var classname = document.getElementsByClassName("changeProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', changeProfile, false);
	}

	var classname = document.getElementsByClassName("editProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', editProfile, false);
	}
	var classname = document.getElementsByClassName("removeProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', removeProfile, false);
	}
	document.querySelector('#profileCreate_button').addEventListener('click', newProfile, false);
}
function editProfile(event) {
	var target = event.currentTarget; // Use currentTarget
	var row = target.parentElement.parentElement; // This is the <tr> element

	target.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>'; // Save icon

	var changeProfileLink = row.querySelector('.changeProfile');
	if (changeProfileLink) {
		changeProfileLink.style.display = 'none';
	}

	var profileLabelSpan = row.querySelector('.profileLabel');
	if (profileLabelSpan) {
		profileLabelSpan.style.display = 'none';
	}

	var inputField = row.querySelector('input[type="textbox"]');
	if (inputField) {
		inputField.style.display = 'block';
	}

	target.removeEventListener('click', editProfile, false);
	target.addEventListener('click', saveProfileName, false);
}
function saveProfileName(event) {
	var target = event.currentTarget; // Use currentTarget
	var row = target.parentElement.parentElement; // This is the <tr> element

	chrome.storage.local.get('profiles', function (items) {
		var currentDomain = document.getElementById('domain_label').textContent;
		var currentProfile = document.getElementById('profile_label').textContent;
		var profile = {};
		var domainProfile = {};

		if (Object.keys(items).length === 0 || Object.keys(items.profiles).length === 0 || Object.keys(items.profiles[currentDomain]).length === 0) {
			domainProfile = JSON.parse('{"currentProfile":"Profile 1", "profileData":{"Profile 1": {}}}');
			if (Object.keys(items.profiles).length !== 0) {
				profile = JSON.parse(JSON.stringify(items.profiles));
			}
			profile[currentDomain] = domainProfile;

		}
		else {
			profile = items.profiles;
			domainProfile = profile[currentDomain];
		}
		var inputField = row.querySelector('input[type="textbox"]');
		if (inputField && target.getAttribute('data-profileName') !== inputField.value) {
			var temp = JSON.parse(JSON.stringify(profile));
			var newProfileName = inputField.value;
			delete profile[currentDomain]['profileData'][target.getAttribute('data-profileName')];
			profile[currentDomain]['profileData'][newProfileName] = temp[currentDomain]['profileData'][target.getAttribute('data-profileName')];
			if (profile[currentDomain]['currentProfile'] == target.getAttribute('data-profileName')) {
				profile[currentDomain]['currentProfile'] = newProfileName;
			}
			chrome.storage.local.set({ "profiles": profile }, function () {
				loadProfiles();
			});
		}
	});
}
function removeProfile(event) {
	var target = event.currentTarget; // Use currentTarget
	var profileName = target.getAttribute('data-profileName');
	chrome.storage.local.get('profiles', function (items) {
		var currentDomain = document.getElementById('domain_label').textContent;
		var currentProfile = document.getElementById('profile_label').textContent;
		var profile = items.profiles;

		delete profile[currentDomain]['profileData'][profileName];

		var newProfile = Object.keys(profile[currentDomain]['profileData'])[0];
		var passedVar = { 'target': { 'innerHTML': newProfile }, 'saveData': false };

		if (currentProfile == profileName) {
			profile[currentDomain]['currentProfile'] = newProfile;
		}

		chrome.storage.local.set({ "profiles": profile }, function () {
			if (currentProfile == profileName) { changeProfile(passedVar); }
			loadProfiles();
		});
	});
}
function resetDomain() {
	chrome.storage.local.get('profiles', function (items) {
		var currentDomain = document.getElementById('domain_label').textContent;
		var profile = items.profiles;

		delete profile[currentDomain];

		chrome.storage.local.set({ "profiles": profile }, function () {
			loadProfiles();
		});
	});
}
function loadProfiles() {
	if (origProfileTable == "") {
		origProfileTable = document.getElementById('profileTable').innerHTML;
	}
	else {
		document.getElementById('profileTable').innerHTML = origProfileTable;
	}
	chrome.storage.local.get('profiles', function (items) {
		var domain = document.getElementById('domain_label').textContent;
		var profile;

		if (Object.keys(items).length === 0 || Object.keys(items.profiles).length === 0 || !items.profiles[currentDomain]) {
			profile = JSON.parse('{"currentProfile":"Profile 1", "profileData":{"Profile 1": {}}}');
		}
		else {
			profile = items.profiles[domain];
		}
		document.getElementById('profile_label').textContent = profile['currentProfile'];

		for (var profileData in profile['profileData']) {
			if (typeof profile['profileData'][profileData] !== 'function') {
				var tableRef = document.getElementById('profileTable').getElementsByTagName('tbody')[0];
				var newRow = tableRef.insertRow(tableRef.rows.length - 1);
				var newCell = newRow.insertCell(0);

				var textbox = document.createElement('input');
				textbox.setAttribute("hidden", "true");
				textbox.type = "textbox";
				textbox.setAttribute("value", profileData);

				var a = document.createElement('a');

				var linkText = document.createTextNode(profileData);

				if (document.getElementById('profile_label').textContent != profileData) {
					a.appendChild(linkText);
					a.href = "#";
					a.className = "changeProfile";

					newCell.appendChild(a);
				}
				else {
					var span = document.createElement('a');
					span.className = "profileLabel";
					span.appendChild(linkText);

					newCell.appendChild(span);
				}

				newCell.appendChild(textbox);


				var newCell2 = newRow.insertCell(1);
				newCell2.className = "profile-actions";

				var editLink = document.createElement('a');
				editLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'; // Edit icon
				editLink.href = "#";
				editLink.setAttribute('data-profileName', profileData);
				editLink.className = "editProfile";

				var removeLink = document.createElement('a');
				removeLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'; // Remove icon
				removeLink.href = "#";
				removeLink.setAttribute('data-profileName', profileData);
				removeLink.className = "removeProfile";

				newCell2.appendChild(editLink);
				newCell2.appendChild(removeLink);
			}
		}
		var tableRef = document.getElementById('profileTable').getElementsByTagName('tbody')[0];
		if (tableRef.rows.length < 4) {
			// This logic needs to be re-evaluated if there's only one profile and we don't want to allow removal.
			// For now, I'll comment it out as it's tied to the old structure and might cause issues.
			// tableRef.getElementsByClassName('removeProfile')[0].parentNode.removeChild(tableRef.getElementsByClassName('removeProfile')[0]);
		}
		addProfileListeners();
		loadDomainCookieStore();
	});
}
function newProfile() {
	chrome.storage.local.get('profiles', function (items) {
		var currentDomain = document.getElementById('domain_label').textContent;
		var newProfileName = document.getElementById('profileName_input').value;
		var profile = {};
		var domainProfile = {};

		if (Object.keys(items).length === 0 || Object.keys(items.profiles).length === 0 || !items.profiles[currentDomain]) {
			domainProfile = JSON.parse('{"currentProfile":"Profile 1", "profileData":{"Profile 1": {}}}');
		}
		else {
			domainProfile = items.profiles[currentDomain];
			profile = items['profiles'];
		}

		domainProfile['profileData'][newProfileName] = "";
		profile[currentDomain] = domainProfile;


		document.getElementById('profile_label').textContent = profile['currentProfile'];

		if (newProfileName != "") {
			chrome.storage.local.set({ "profiles": profile }, function () {
				loadProfiles();
			});
		}

		return;
	});
}
function extrapolateUrlFromCookie(cookie) {
	var prefix = cookie.secure ? "https://" : "http://";
	if (cookie.domain.charAt(0) == ".")
		prefix += "www";

	return prefix + cookie.domain + cookie.path;
}
function changeProfile(event) {
	var target = event.target;
	var saveData = event.saveData;
	var currentDomain = document.getElementById('domain_label').textContent;
	chrome.cookies.getAll({ domain: currentDomain }, function (cookies) {
		var currentProfile = document.getElementById('profile_label').textContent;

		chrome.storage.local.get('profiles', function (items) {
			var currentDomain = document.getElementById('domain_label').textContent;
			var oldProfileData = cookies;
			var newProfileData = items.profiles[currentDomain]['profileData'][target.innerHTML];

			var profile = items.profiles;
			var domainProfiles = profile[currentDomain]['profileData'];

			domainProfiles[currentProfile] = oldProfileData;
			profile[currentDomain]['currentProfile'] = target.innerHTML;
			profile[currentDomain]['profileData'] = domainProfiles;


			for (var i = 0; i < cookies.length; i++) {
				chrome.cookies.remove({ url: extrapolateUrlFromCookie(cookies[i]), name: cookies[i].name });
			}

			if (newProfileData.length > 0) {
				for (var i = 0; i < newProfileData.length; i++) {
					try {
						newProfileData[i]['url'] = "http" + (newProfileData[i]['secure'] ? "s" : "") + "://" + newProfileData[i]['domain'].replace(/^\./, "");
						delete newProfileData[i]['hostOnly'];
						delete newProfileData[i]['session'];
						chrome.cookies.set(newProfileData[i]);
					} catch (e) {
						console.log(e)
					}
				}
			}



			if (typeof saveData === 'undefined' || saveData == true) {
				chrome.storage.local.set({ "profiles": profile }, function () {
					loadProfiles();
				});
			}


			chrome.tabs.query({ active: true, currentWindow: true }, function (arrayOfTabs) {
				chrome.scripting.executeScript({
					target: { tabId: arrayOfTabs[0].id },
					function: () => {
						window.location.reload();
					}
				});
			});

		});

	});
}
// END PROFILE FUNCTIONS //



// BEGIN COOKIE FUNCTIONS //
function loadDomainCookieStore() {
	var currentDomain = document.getElementById('domain_label').textContent;
	chrome.cookies.getAll({ domain: currentDomain }, function (cookies) {
	});
}
// END COOKIE FUNCTIONS //

function domainLoaded() { //CODE TO EXECUTE WHEN DOMAIN HAS BEEN LOADED
	document.getElementById('domain_label').innerHTML = currentDomain;
	document.querySelector('#profileCreate_button').setAttribute('data-domain', currentDomain);
}

function init() { //POP-UP OPENED, INITIALIZE
	chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
		tab = tabs[0];
		url = tab.url;
		currentDomain = getDomain(url);
		domainLoaded();
	});
	document.querySelector('#profileCreate_button').addEventListener('click', newProfile, false);
	loadProfiles();
}

document.addEventListener('DOMContentLoaded', function () {
	init();
	document.querySelector('#profileCreate_button').addEventListener('click', newProfile);
});