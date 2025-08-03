# Changelog
## 2.0.0
- Migrated to Manifest V3.
- Removed jQuery and Bootstrap dependencies.
- Refactored JavaScript to vanilla JS.
- Refactored CSS to plain CSS.
- Removed unnecessary files and folders (less, scss, fonts, old js/css libraries).
- Fixed `chrome.tabs.executeScript` deprecation by using `chrome.scripting.executeScript`.
- Added null checks and try-catch for cookie handling to prevent errors.
- Fixed Uncaught (in promise) Error: Failed to parse or set cookie named "__Host-next-auth.csrf-token".
- Optimized overall User Interface and User Experience


## 1.3.3
- Extension was broken. Update code to remove leading '.' from url that was introduced with chrome api update.

## 1.3.2
- Fixed bug that prevented extension from working on certain https-only websites.

## 1.3
- Added Data tab to Options Page, allowing users to view, edit, & delete their profile data.
- Fixed email button
- Updated About tab on Options page

## 1.2
- Resolved failure to load cookie profile for certain url formats
- Added Options page with Changelog information

## 1.1
- Fixed edit button

## 1.0
- Initial Release