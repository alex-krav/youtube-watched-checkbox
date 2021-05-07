'use strict';

interface Message {
  url: string;
}

interface Thumbnail extends HTMLElement {
  videoId?: string;
}

interface Holder {
  [key: string]: number
}

const thumbnailPath = 'ytd-thumbnail a[id=\'thumbnail\']';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.ping) {
    console.log('received ping');
    sendResponse({pong: true});
    return;
  }
  console.log('path updated: ' + request.url);
  processUrl(request.url);
});

// first time load of website
processUrl(window.location + '');

/**
 * Choose selectors depending on url
 * @param {string} url
 */
function processUrl(url: string) {
  const youtubeHostRegex = /https?:\/\/(www\.)?youtube\.com/;
  const path = url.replace(youtubeHostRegex, '');
  console.log('PATH: ' + path);

  let elementsPath: string[] = [];
  let containersPath: string[] = [];
  let containerId: number[] = [];
  let containerItem: string[] = [];

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
    const startTime = Date.now();
    setTimeout(() => {
      console.log('timeout 1: ' + (Date.now() - startTime));
      elements = document.querySelectorAll(elementPath);
      if (!elements.length) {
        setTimeout(() => {
          console.log('timeout 2: ' + (Date.now() - startTime));
          elements = document.querySelectorAll(elementPath);
          setListeners(elementsPath, containersPath, containerId, containerItem);
          if (path.match(/^\/watch/)) {
            setListenerForWatchPage(url);
          }
        }, 5000);
      } else {
        setListeners(elementsPath, containersPath, containerId, containerItem);
        if (path.match(/^\/watch/)) {
          setListenerForWatchPage(url);
        }
      }
    }, 5000);
  } else {
    setListeners(elementsPath, containersPath, containerId, containerItem);
    if (path.match(/^\/watch/)) {
      setListenerForWatchPage(url);
    }
  }
}

/**
 * Select and process video thumbnails, add MutationObservers for container elements
 * @param {array} elements
 * @param {array} containers
 * @param {array} containerIds
 * @param {array} containerItems
 */
function setListeners(elements: string[], containers: string[], containerIds: number[], containerItems: string[]) {
  for (let i = 0; i < elements.length; i++) {
    const elementPath = elements[i] + ' ' + thumbnailPath;
    console.log('elementPath: ' + elementPath);
    const containerPath = containers[i];
    console.log('containerPath: ' + containerPath);

    const thumbnailElements: NodeListOf<HTMLElement> = document.querySelectorAll(elementPath);

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
        } catch (err: unknown) {
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
            } catch (err: unknown) {
              console.log(err);
            }
          }
        }
      }
    }
  }
}

/**
 * Add checkbox to video player
 * @param {string} url
 */
function setListenerForWatchPage(url: string) {
  console.log('watch page URL: ' + url);
  const player: Thumbnail = document.querySelector('#primary #player');
  const videoId = new URL(url).searchParams.get('v');
  console.log('watch page videoId: ' + videoId);

  if (player.videoId) {
    player.videoId = videoId; // current video value
    chrome.storage.sync.get(player.videoId, (result: Holder) => {
      const checkbox: HTMLElement = player.querySelector('.youtube-watched-checkbox');
      if (result[player.videoId]) {
        checkbox.style.zIndex = '1000';
      } else {
        checkbox.style.zIndex = '-1000';
      }
    });
    return;
  }

  player.videoId = videoId;
  const checkbox = document.createElement('div');
  checkbox.className = 'youtube-watched-checkbox';
  checkbox.innerHTML = 'WATCHED';
  player.append(checkbox);

  chrome.storage.sync.get(videoId, (result: Holder) => {
    if (result[videoId]) {
      console.log('Read for watch page: ' + JSON.stringify(result));
      checkbox.style.zIndex = '1000';
    }
  });

  // todo: check if listeners not applied twice
  player.addEventListener('mouseenter', {
    handleEvent(event) {
      const currentPlayer = event.currentTarget as Thumbnail;
      const checkbox: HTMLElement = currentPlayer.querySelector('.youtube-watched-checkbox');

      chrome.storage.sync.get(currentPlayer.videoId, (result: Holder) => {
        if (!result[currentPlayer.videoId]) {
          checkbox.style.zIndex = '1000';
        }
      });
    },
  });

  player.addEventListener('mouseleave', {
    handleEvent(event) {
      const currentPlayer = event.currentTarget as Thumbnail;
      const checkbox: HTMLElement = currentPlayer.querySelector('.youtube-watched-checkbox');

      chrome.storage.sync.get(currentPlayer.videoId, (result: Holder) => {
        if (!result[currentPlayer.videoId]) {
          checkbox.style.zIndex = '-1000';
        }
      });
    },
  });

  checkbox.addEventListener('click', {
    handleEvent(event) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();

      const currentCheckbox = event.currentTarget as HTMLElement;
      const player: Thumbnail = currentCheckbox.parentElement;
      const videoId = player.videoId;

      chrome.storage.sync.get(videoId, (result: Holder) => {
        if (result[videoId]) {
          chrome.storage.sync.remove(videoId, () => {
            console.log('Delete ' + JSON.stringify(videoId));
          });
          currentCheckbox.style.zIndex = '-1000';
        } else {
          const obj: Holder = {};
          obj[videoId] = 1;
          chrome.storage.sync.set(obj, () => {
            console.log('Save ' + JSON.stringify(obj));
          });
          currentCheckbox.style.zIndex = '1000';
        }
      });
    },
  });
}

/**
 * Add checkbox to thumbnail, darken if selected
 * @param {Thumbnail} thumbnail
 */
function processThumbnail(thumbnail: Thumbnail) {
  if (thumbnail.videoId) {
    console.log('processing thumbnail: ' + thumbnail.videoId);
    chrome.storage.sync.get(thumbnail.videoId, (result: Holder) => {
      const checkbox: HTMLElement = thumbnail.querySelector('.youtube-watched-checkbox');
      if (result[thumbnail.videoId]) {
        checkbox.style.zIndex = '1000';
        thumbnail.classList.add('youtube-watched-thumbnail');
      } else {
        checkbox.style.zIndex = '-1000';
        thumbnail.classList.remove('youtube-watched-thumbnail');
      }
    });
    return; // todo: check for possible source of not processing thumbnails on some pages
  }
  const href = thumbnail.getAttribute('href');
  if (!href) return;

  const url = new URL(window.location.origin + href);
  const videoId = url.searchParams.get('v');
  console.log('found videoId: ' + videoId);
  if (!videoId) return;

  thumbnail.videoId = videoId;
  const checkbox = document.createElement('div');
  checkbox.className = 'youtube-watched-checkbox';
  checkbox.innerHTML = 'WATCHED';
  thumbnail.append(checkbox);

  chrome.storage.sync.get(videoId, (result: Holder) => {
    if (result[videoId]) {
      console.log('Read ' + JSON.stringify(result));
      checkbox.style.zIndex = '1000';
      thumbnail.classList.add('youtube-watched-thumbnail');
    }
  });

  // todo: check if listeners not applied twice
  thumbnail.addEventListener('mouseenter', {
    handleEvent(event) {
      const currentThumbnail = event.currentTarget as Thumbnail;
      const checkbox: HTMLElement = currentThumbnail.querySelector('.youtube-watched-checkbox');

      chrome.storage.sync.get(thumbnail.videoId, (result: Holder) => {
        if (!result[thumbnail.videoId]) {
          checkbox.style.zIndex = '1000';
        }
      });
    },
  });

  thumbnail.addEventListener('mouseleave', {
    handleEvent(event) {
      const currentThumbnail = event.currentTarget as Thumbnail;
      const checkbox: HTMLElement = currentThumbnail.querySelector('.youtube-watched-checkbox');

      chrome.storage.sync.get(thumbnail.videoId, (result: Holder) => {
        if (!result[thumbnail.videoId]) {
          checkbox.style.zIndex = '-1000';
        }
      });
    },
  });

  checkbox.addEventListener('click', {
    handleEvent(event) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();

      const currentCheckbox = event.currentTarget as HTMLElement;
      const thumbnail: Thumbnail = currentCheckbox.parentElement;
      const videoId = thumbnail.videoId;

      chrome.storage.sync.get(videoId, (result: Holder) => {
        if (result[videoId]) {
          chrome.storage.sync.remove(videoId, () => {
            console.log('Delete ' + JSON.stringify(videoId));
          });
          currentCheckbox.style.zIndex = '-1000';
          thumbnail.classList.remove('youtube-watched-thumbnail');
        } else {
          const obj: Holder = {};
          obj[videoId] = 1;
          chrome.storage.sync.set(obj, () => {
            console.log('Save ' + JSON.stringify(obj));
          });
          currentCheckbox.style.zIndex = '1000';
          thumbnail.classList.add('youtube-watched-thumbnail');
        }
      });
    },
  });
}

/**
 * Callback for MutationObserver
 * @param {MutationRecord[]} mutations
 * @param {string} element
 */
function callback(mutations: MutationRecord[], element: string) {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      if (node.matches(element)) {
        console.log('observer processing thumbnail...');
        const thumbnail: Thumbnail = node.querySelector(thumbnailPath);
        if (thumbnail) {
          processThumbnail(thumbnail);
        }
      }
    }
  }
  // todo: on some pages (home etc - where >1 container possible) add listeners again,
  //  as not all might be loaded right away
}
