

function init(){
	document.getElementById('about-extension-version').textContent = chrome.runtime.getManifest().version;
	loadProfileData();
}

function loadProfileData(){
	chrome.storage.local.get('profiles', function(items){
		var profile;
		if(Object.keys(items).length === 0 || Object.keys(items.profiles).length === 0){
			
		}
		else{
			profile = JSON.parse(JSON.stringify(items.profiles));
			document.getElementById('profile-data-textarea').value = JSON.stringify(profile, undefined, "\t");
		}
	});
	
}

function saveProfileData(){
	var profile = JSON.parse(document.getElementById('profile-data-textarea').value);
	if(Object.keys(profile).length !== 0){
		if(confirm("Are you sure you want to save profile data?")){
			chrome.storage.local.set({'profiles': profile}, function(){
			});
		}
		else{
		}
		
	}
}

function clearProfileData(){
	var profile = {};
	if(confirm("Are you sure you want to clear profile data?")){
		chrome.storage.local.set({'profiles': profile}, function(){
			document.getElementById('profile-data-textarea').value = "";
		});
	}
	else{
	}
}
function exportProfileData(){
	chrome.storage.local.get('profiles', function(items){
		var profile;
		if(Object.keys(items).length === 0 || Object.keys(items.profiles).length === 0){
			
		}
		else{
			profile = JSON.parse(JSON.stringify(items.profiles));
			var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(profile, undefined, "\t"));
			downloadURI(dataUri, "CookieProfileSwitcher.json");
		}
	});
}

function importProfileData(e){
	var files = e.target.files, reader = new FileReader();
	reader.onload = _imp;
	reader.readAsText(files[0]);
}

function _imp() {
	var _myImportedData = JSON.parse(this.result);
	if(Object.keys(_myImportedData).length !== 0){
		chrome.storage.local.set({'profiles': _myImportedData}, function(){
			document.getElementById('profile-data-textarea').value = JSON.stringify(_myImportedData, undefined, "\t");
		});
	}
	document.getElementById('import-profile-data-input').value = "";
}


function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  document.querySelector('#save-profile-data').addEventListener('click', saveProfileData);
  document.querySelector('#clear-profile-data').addEventListener('click', clearProfileData);
  document.querySelector('#import-profile-data').addEventListener('click', function(){document.getElementById('import-profile-data-input').click();});
  document.querySelector('#import-profile-data-input').addEventListener('change', importProfileData);
  document.querySelector('#export-profile-data').addEventListener('click', exportProfileData);
});
