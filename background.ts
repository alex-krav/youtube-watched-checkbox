'use strict';

// page updated (user clicked on video etc)
import {Message} from './scripts/content';

let prevUrl = '';

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  const currentUrl = details.url;
  console.log('prev: ' + prevUrl + ', current: ' + currentUrl);

  if (currentUrl && prevUrl && currentUrl !== prevUrl && !sameVideoPage(prevUrl, currentUrl)) {
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
      const PAGE_LOAD_TIMEOUT = 5000;

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
            }, PAGE_LOAD_TIMEOUT);
          }
        });
      }, PAGE_LOAD_TIMEOUT);
    }
  });
}

/**
 * Check if we weren't redirected from watch page to watch page within playlist.
 * @param {string} prevUrl
 * @param {string} currentUrl
 * @return {boolean} true if same video page
 */
function sameVideoPage(prevUrl:string, currentUrl:string) {
  const youtubeHostRegex = /https?:\/\/(www\.)?youtube\.com/;
  const prevPath = prevUrl.replace(youtubeHostRegex, '');
  const currentPath = currentUrl.replace(youtubeHostRegex, '');

  if (prevPath.match(/^\/watch/) && currentPath.match(/^\/watch/)) {
    const url1 = new URL(prevUrl);
    const videoId1 = url1.searchParams.get('v');
    const url2 = new URL(currentUrl);
    const videoId2 = url2.searchParams.get('v');

    return videoId1 === videoId2;
  } else {
    return false;
  }
}
