'use strict';

// page updated (user clicked on video etc)
const youtubeHostRegex = /https?:\/\/(www\.)?youtube\.com/;
let prevUrl = '';

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  const currentUrl = details.url;
  console.log('prev: ' + prevUrl + ', current: ' + currentUrl);
  const prevPath = prevUrl.replace(youtubeHostRegex, '');
  const currentPath = currentUrl.replace(youtubeHostRegex, '');
  let videoId1 = '1'; let videoId2 = '2';
  if (prevPath.match(/^\/watch/) && currentPath.match(/^\/watch/)) {
    const url1 = new URL(prevUrl); videoId1 = url1.searchParams.get('v');
    const url2 = new URL(currentUrl); videoId2 = url2.searchParams.get('v');
  }

  if (currentUrl && prevUrl && currentUrl !== prevUrl && videoId1 !== videoId2) {
    console.log('sending url: ' + currentUrl);

    // window.onload = (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {url: currentUrl}, null);
    });
    // };
  }
  prevUrl = currentUrl;
}, {url: [{urlMatches: 'https://www.youtube.com/'}]}); // todo: check if url causing bugs?
