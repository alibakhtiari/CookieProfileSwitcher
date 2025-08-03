
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
	var target = event.target;
	var oldProfileName = target.getAttribute('data-profileName');
	target.textContent = "save";
	if (target.parentElement.parentElement.parentElement.querySelector('.changeProfile')) {
		target.parentElement.parentElement.parentElement.querySelector('.changeProfile').style.display = 'none';
	}
	target.parentElement.parentElement.parentElement.querySelector('.profileLabel').style.display = 'none';
	target.parentElement.parentElement.parentElement.querySelector('input').style.display = 'block';
	target.removeEventListener('click', editProfile, false);
	target.addEventListener('click', saveProfileName, false);
}
function saveProfileName(event) {
	var target = event.target;


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
		if (target.getAttribute('data-profileName') !== target.parentElement.parentElement.parentElement.querySelector('input').value) {
			var temp = JSON.parse(JSON.stringify(profile));
			var newProfileName = target.parentElement.parentElement.parentElement.querySelector('input').value;
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
	var target = event.target.getAttribute('data-profileName');
	chrome.storage.local.get('profiles', function (items) {
		var currentDomain = document.getElementById('domain_label').textContent;
		var currentProfile = document.getElementById('profile_label').textContent;
		var profile = items.profiles;

		delete profile[currentDomain]['profileData'][target];

		var newProfile = Object.keys(profile[currentDomain]['profileData'])[0];
		var passedVar = { 'target': { 'innerHTML': newProfile }, 'saveData': false };

		if (currentProfile == target) {
			profile[currentDomain]['currentProfile'] = newProfile;
		}

		chrome.storage.local.set({ "profiles": profile }, function () {
			if (currentProfile == target) { changeProfile(passedVar); }
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
				newCell2.className = "no-wrap";
				var a2 = document.createElement('a');
				var link2Text = document.createTextNode("edit");

				a2.appendChild(link2Text);
				a2.href = "#";
				a2.setAttribute('data-profileName', profileData);
				a2.className = "editProfile";

				var a3 = document.createElement('a');
				var link3Text = document.createTextNode("remove");

				a3.appendChild(link3Text);
				a3.href = "#";
				a3.setAttribute('data-profileName', profileData);
				a3.className = "removeProfile";

				var cellSpan = document.createElement('span');
				cellSpan.appendChild(a2);
				cellSpan.appendChild(document.createTextNode(" "));
				cellSpan.appendChild(a3);
				cellSpan.className = "smallText";

				newCell2.appendChild(cellSpan);
			}
		}
		var tableRef = document.getElementById('profileTable').getElementsByTagName('tbody')[0];
		if (tableRef.rows.length < 4) {
			tableRef.getElementsByClassName('removeProfile')[0].parentNode.removeChild(tableRef.getElementsByClassName('removeProfile')[0]);
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

			// Save current cookies
			domainProfiles[currentProfile] = oldProfileData;
			profile[currentDomain]['currentProfile'] = target.innerHTML;
			profile[currentDomain]['profileData'] = domainProfiles;

			// Clear all current cookies for the domain
			for (var i = 0; i < cookies.length; i++) {
				chrome.cookies.remove({ url: extrapolateUrlFromCookie(cookies[i]), name: cookies[i].name });
			}

			// Restore selected profile cookies
			if (newProfileData.length > 0) {
				for (var i = 0; i < newProfileData.length; i++) {
					try {
						let cookie = { ...newProfileData[i] };

						cookie.url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain.replace(/^\./, "");

						// Remove invalid properties
						delete cookie.hostOnly;
						delete cookie.session;

						// Fix for __Host- cookies
						if (cookie.name.startsWith("__Host-")) {
							cookie.secure = true;
							cookie.path = "/";
							delete cookie.domain; // Required by __Host- rules
						}

						// Try to set cookie
						chrome.cookies.set(cookie, function (setCookie) {
							if (chrome.runtime.lastError) {
								console.warn("Failed to set cookie:", cookie.name, chrome.runtime.lastError.message);
							}
						});
					} catch (e) {
						console.error("Error setting cookie:", e);
					}
				}
			}

			if (typeof saveData === 'undefined' || saveData === true) {
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
