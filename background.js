"use strict";

// page updated (user clicked on video etc)
let prevUrl = "";

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
	let currentUrl = details.url;
	console.log("prev: " + prevUrl + ", current: " + currentUrl);

	if (currentUrl && prevUrl && currentUrl !== prevUrl) {
		console.log("sending url: " + currentUrl);

		// window.onload = (event) => {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {url: currentUrl}, null);
			});
		// };
	}
	prevUrl = currentUrl;

}, {url: [{urlMatches : 'https://www.youtube.com/'}]});