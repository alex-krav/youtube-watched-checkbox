'use strict';

const thumbnailPath = 'ytd-thumbnail a[id=\'thumbnail\']';

// page updated (user clicked on video etc)
chrome.runtime.onMessage.addListener((message) => {
  console.log('path updated: ' + message.url);
  processUrl(message.url);
});

// first time load of website
processUrl(window.location + '');

/**
 * Choose selectors depending on url
 * @param {string} url
 */
function processUrl(url) {
  const startTime = Date.now();
  const youtubeHostRegex = /https?:\/\/(www\.)?youtube\.com/;
  const path = url.replace(youtubeHostRegex, '');
  console.log('PATH: ' + path);

  let elementsPath = [];
  let containersPath = [];
  let containerId = [];
  let containerItem = [];

  if (path.match(/^\/$/)) {
    console.log('MATCHED HOME');
    elementsPath = ['ytd-rich-grid-renderer ytd-rich-item-renderer ytd-rich-grid-media'];
    containersPath = ['ytd-rich-grid-renderer #contents'];
    containerId = [0];
    containerItem = ['ytd-rich-item-renderer'];
  } else if (path.match(/^\/results/)) {
    // fixme: 'people also watch' AND after it don't work
    console.log('MATCHED HOME SEARCH');
    elementsPath = ['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer',
      'ytd-vertical-list-renderer ytd-video-renderer'];
    containersPath = ['ytd-section-list-renderer > #contents', 'ytd-vertical-list-renderer > #items'];
    containerId = [2, 0];
    containerItem = ['ytd-item-section-renderer', 'ytd-video-renderer'];
  } else if (path.match(/^\/user\/[^/]*|^\/c\/[^/]*\/featured$/)) {
    // fixme: only first 3 playlists work
    console.log('MATCHED USER HOME'); // todo: observer for loading of new playlists
    elementsPath = ['yt-horizontal-list-renderer ytd-grid-video-renderer'];
    containersPath = ['yt-horizontal-list-renderer #items'];
    containerId = [-1];
    containerItem = ['ytd-grid-video-renderer'];
  } else if (path.match(/^\/c\/[^/]*\/[^f]/)) {
    if (path.match(/^\/c\/[^/]*\/videos$/)) {
      console.log('MATCHED USER VIDEOS');
      elementsPath = ['ytd-grid-renderer ytd-grid-video-renderer'];
      containersPath = ['ytd-grid-renderer #items'];
      containerId = [0];
      containerItem = ['ytd-grid-video-renderer'];
    } else if (path.match(/^\/c\/[^/]*\/search/)) {
      // fixme first: only first 3 videos work
      // fixme navigation: new videos after scroll don't work
      console.log('MATCHED USER SEARCH');
      elementsPath = ['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'];
      containersPath = ['ytd-section-list-renderer > #contents'];
      containerId = [1];
      containerItem = ['ytd-item-section-renderer'];
    }
  } else if (path.match(/^\/channel\//)) {
    // channel
    if (path.match(/^\/channel\/[^/]*$|^\/channel\/[^/]*\/featured/)) {
      console.log('MATCHED CHANNEL HOME'); // todo: observer for loading of new playlists
      elementsPath = ['yt-horizontal-list-renderer ytd-grid-video-renderer'];
      containersPath = ['yt-horizontal-list-renderer #items'];
      containerId = [-1];
      containerItem = ['ytd-grid-video-renderer'];
    } else if (path.match(/^\/channel\/[^/]*\/videos$/)) {
      console.log('MATCHED CHANNEL VIDEOS');
      elementsPath = ['ytd-grid-renderer ytd-grid-video-renderer'];
      containersPath = ['ytd-grid-renderer #items'];
      containerId = [0];
      containerItem = ['ytd-grid-video-renderer'];
    } else if (path.match(/^\/channel\/[^/]*\/search/)) {
      // fixme: on first load - processed first 3 videos
      // fixme: didn't work on webNavigation.HistoryUpdated
      console.log('MATCHED CHANNEL SEARCH');
      elementsPath = ['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'];
      containersPath = ['ytd-section-list-renderer > #contents'];
      containerId = [1];
      containerItem = ['ytd-item-section-renderer'];
    }
  } else if (path.match(/^\/watch/)) {
    // todo: add 'Done' for video page for convenience
    // watch
    if (path.match(/^\/watch\?.*list=/)) {
      console.log('MATCHED VIDEO WITH PLAYLIST AND RELATED');
      elementsPath = ['ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer',
        'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer'];
      containersPath = ['ytd-playlist-panel-renderer #items',
        'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents'];
      containerId = [0, 0];
      containerItem = ['ytd-playlist-panel-video-renderer', 'ytd-compact-video-renderer'];
    } else {
      console.log('MATCHED VIDEO WITH RELATED');
      elementsPath = ['ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer'];
      containersPath = ['ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents'];
      containerId = [0];
      containerItem = ['ytd-compact-video-renderer'];
    }
  } else if (path.match(/^\/playlist/)) {
    console.log('MATCHED PLAYLIST');
    elementsPath = ['ytd-playlist-video-list-renderer ytd-playlist-video-renderer'];
    containersPath = ['ytd-playlist-video-list-renderer #contents'];
    containerId = [0];
    containerItem = ['ytd-playlist-video-renderer'];
  } else if (path.match(/^\/feed/)) {
    // feed
    if (path.match(/^\/feed\/subscriptions$|^\/feed\/library$/)) {
      // fixme: /feed/subscriptions?flow=2 - all don't work
      // fixme: /feed/subscriptions - videos after scroll don't work
      // fixme: /feed/library - 'show more' don't work
      console.log('MATCHED FEED SUBSCRIPTIONS OR LIBRARY');
      elementsPath = ['ytd-grid-renderer ytd-grid-video-renderer'];
      containersPath = ['ytd-grid-renderer #items'];
      containerId = [-1];
      containerItem = ['ytd-grid-video-renderer'];
    } else if (path.match(/^\/feed\/explore$/)) {
      console.log('MATCHED FEED EXPLORE');
      elementsPath = ['ytd-expanded-shelf-contents-renderer ytd-video-renderer'];
      containersPath = ['ytd-expanded-shelf-contents-renderer #grid-container'];
      containerId = [0];
      containerItem = ['ytd-video-renderer'];
    } else if (path.match(/^\/feed\/history$/)) {
      // fixme: videos after scroll don't work
      console.log('MATCHED FEED HISTORY');
      elementsPath = ['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'];
      containersPath = ['ytd-section-list-renderer > #contents'];
      containerId = [0];
      containerItem = ['ytd-item-section-renderer'];
    }
  } else {
    console.log('DIDN\'T MATCH'); // todo: check not youtube websites
  }

  const elementPath = elementsPath[0] + ' ' + thumbnailPath;
  console.log('TEST: ' + elementPath);
  let elements = document.querySelectorAll(elementPath);

  if (!elements.length) {
    setTimeout(() => {
      console.log('timeout: ' + (Date.now() - startTime));
      elements = document.querySelectorAll(elementPath);
      if (elements.length) {
        setListeners(elementsPath, containersPath, containerId, containerItem);
      }
    }, 10000);
  } else {
    setListeners(elementsPath, containersPath, containerId, containerItem);
  }
}

/**
 * Select and process video thumbnails, add MutationObservers for container elements
 * @param {array} elements
 * @param {array} containers
 * @param {array} containerIds
 * @param {array} containerItems
 */
function setListeners(elements, containers, containerIds, containerItems) {
  for (let i = 0; i < elements.length; i++) {
    const elementPath = elements[i] + ' ' + thumbnailPath;
    console.log('elementPath: ' + elementPath);
    const containerPath = containers[i];
    console.log('containerPath: ' + containerPath);

    const thumbnailElements = document.querySelectorAll(elementPath);

    if (thumbnailElements && thumbnailElements.length) {
      for (const thumbnail of thumbnailElements) {
        processThumbnail(thumbnail);
      }

      const observer = new MutationObserver((mutations) => callback(mutations, containerItems[i]));
      if (containerIds[i] > -1) {
        const container = document.querySelectorAll(containerPath)[containerIds[i]];
        try {
          if (container) {
            observer.observe(container, {childList: true});
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        const containers = document.querySelectorAll(containerPath);
        if (containers) {
          for (const container of containers) {
            try {
              if (container) {
                observer.observe(container, {childList: true});
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    }
  }
}

/**
 * Add checkbox to thumbnail, darken if selected
 * @param {Element} thumbnail
 */
function processThumbnail(thumbnail) {
  if (thumbnail.videoId) {
    console.log('OOPS! thumb has ' + thumbnail.videoId);
    return;
  }
  const href = thumbnail.getAttribute('href');
  if (!href) return;

  const url = new URL(window.location.origin + href);
  const videoId = url.searchParams.get('v');
  console.log('found videoId: ' + videoId);
  if (!videoId) return;

  thumbnail.videoId = videoId;
  thumbnail.done = false;

  chrome.storage.local.get(videoId, function(result) {
    if (result[videoId]) {
      console.log('Read ' + JSON.stringify(result));
      thumbnail.style.opacity = '0.5';
      thumbnail.done = true;
    }
  });

  thumbnail.addEventListener('mouseenter', {
    handleEvent(event) {
      const target = event.currentTarget;
      const videoId = target.videoId;

      if (!target.done) {
        target.done = true;
        const obj = {}; obj[videoId] = 1;
        chrome.storage.local.set(obj, function() {
          console.log('Save ' + JSON.stringify(obj));
        });
        target.style.opacity = 0.5;
      } else {
        target.done = false;
        chrome.storage.local.remove(videoId, function() {
          console.log('Delete ' + JSON.stringify(videoId));
        });
        target.style.opacity = 1;
      }
    },
  });
}

/**
 * Callback for MutationObserver
 * @param {MutationRecord[]} mutations
 * @param {string} element
 */
function callback(mutations, element) {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      if (node.matches(element)) {
        console.log('observer processing thumbnail...');
        const thumbnail = node.querySelector(thumbnailPath);
        if (thumbnail) {
          processThumbnail(thumbnail);
        }
      }
    }
  }
  // todo: on some pages (home etc - where >1 container possible) add listeners again,
  //  as not all might be loaded right away
}
