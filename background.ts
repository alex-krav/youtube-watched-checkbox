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
    // window.onload = (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      ensureSendMessage(tabs[0].id, {url: currentUrl}, null);
    });
    // };
  }
  prevUrl = currentUrl;
}, {url: [{urlMatches: 'https://www.youtube.com/'}]}); // todo: check if url causing bugs?

/**
 * Ensure message is sent to content script
 * @param {number} tabId
 * @param {Message} message
 * @param {function} callback
 */
function ensureSendMessage(tabId: number, message: Message, callback: (result: chrome.tabs.Tab[]) => void) {
  chrome.tabs.sendMessage(tabId, {ping: true}, function(response) {
    if (response && response.pong) { // Content script ready
      console.log('received pong');
      console.log('sending url: ' + JSON.stringify(message));
      chrome.tabs.sendMessage(tabId, message, callback);
    } else {
      const startTime = Date.now();
      setTimeout(() => {
        console.log('background timeout 1: ' + (Date.now() - startTime));
        chrome.tabs.sendMessage(tabId, {ping: true}, function(response) {
          if (response && response.pong) { // Content script ready
            console.log('received pong');
            console.log('sending url: ' + JSON.stringify(message));
            chrome.tabs.sendMessage(tabId, message, callback);
          } else {
            setTimeout(() => { // last chance
              console.log('background timeout 2: ' + (Date.now() - startTime));
              console.log('sending url: ' + JSON.stringify(message));
              chrome.tabs.sendMessage(tabId, message, callback);
            }, 5000);
          }
        });
      }, 5000);
    }
  });
}
