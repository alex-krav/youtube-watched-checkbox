'use strict';

export interface Message {
  url: string;
  ping?: boolean;
  pong?: boolean;
}

export interface Thumbnail extends HTMLElement {
  videoId?: string;
}

interface Holder {
  [key: string]: number
}

const YOUTUBE_HOST_REGEX = /https?:\/\/(www\.)?youtube\.com/;
const THUMBNAIL_PATH = 'ytd-thumbnail a[id=\'thumbnail\']';
const PAGE_LOAD_TIMEOUT = 5000;

chrome.runtime.onMessage.addListener(function(request: Message, sender, sendResponse) {
  if (request.ping) {
    console.log('received ping');
    sendResponse({pong: true});
  }
  console.log('path updated: ' + request.url);
  sendResponse({pong: true});
  processUrl(request.url);
});

// first time load of website
processUrl(window.location + '');

/**
 * Choose selectors for URL and process elements.
 * @param {string} url
 */
function processUrl(url: string) {
  if (!url) return;

  const path = url.replace(YOUTUBE_HOST_REGEX, '');
  console.log('PATH: ' + path);

  const elementsPath: string[] = [];
  const containersPath: string[] = [];
  const containerId: number[] = [];
  const containerItem: string[] = [];

  setElementSelectors(path, elementsPath, containersPath, containerId, containerItem);
  setListeners(url, path, elementsPath, containersPath, containerId, containerItem);
}

/**
 * Set element selectors depending on page.
 * @param {string} path
 * @param {string[]} elementsPath
 * @param {string[]} containersPath
 * @param {string[]} containerId
 * @param {string[]} containerItem
 */
export function setElementSelectors(path: string, elementsPath: string[], containersPath: string[],
    containerId: number[], containerItem: string[]): void {
  if (path.match(/^\/$/)) {
    console.log('MATCHED HOME');
    elementsPath.push('ytd-rich-grid-renderer ytd-rich-item-renderer ytd-rich-grid-media');
    containersPath.push('ytd-rich-grid-renderer #contents');
    containerId.push(0);
    containerItem.push('ytd-rich-item-renderer');
  } else if (path.match(/^\/results/)) {
    // fixme: 'people also watch' AND after it don't work
    console.log('MATCHED HOME SEARCH');
    elementsPath.push('ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer',
        'ytd-vertical-list-renderer ytd-video-renderer');
    containersPath.push('ytd-section-list-renderer > #contents', 'ytd-vertical-list-renderer > #items');
    containerId.push(2, 0);
    containerItem.push('ytd-item-section-renderer', 'ytd-video-renderer');
  } else if (path.match(/^\/user\/[^/]*|^\/c\/[^/]*\/featured$/)) {
    // fixme: only first 3 playlists work
    console.log('MATCHED USER HOME'); // todo: observer for loading of new playlists
    elementsPath.push('yt-horizontal-list-renderer ytd-grid-video-renderer');
    containersPath.push('yt-horizontal-list-renderer #items');
    containerId.push(-1);
    containerItem.push('ytd-grid-video-renderer');
  } else if (path.match(/^\/c\/[^/]*\/[^f]/)) {
    if (path.match(/^\/c\/[^/]*\/videos$/)) {
      console.log('MATCHED USER VIDEOS');
      elementsPath.push('ytd-grid-renderer ytd-grid-video-renderer');
      containersPath.push('ytd-grid-renderer #items');
      containerId.push(0);
      containerItem.push('ytd-grid-video-renderer');
    } else if (path.match(/^\/c\/[^/]*\/search/)) {
      // fixme first: only first 3 videos work
      // fixme navigation: new videos after scroll don't work
      console.log('MATCHED USER SEARCH');
      elementsPath.push('ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer');
      containersPath.push('ytd-section-list-renderer > #contents');
      containerId.push(1);
      containerItem.push('ytd-item-section-renderer');
    }
  } else if (path.match(/^\/channel\//)) {
    // channel
    if (path.match(/^\/channel\/[^/]*$|^\/channel\/[^/]*\/featured/)) {
      console.log('MATCHED CHANNEL HOME'); // todo: observer for loading of new playlists
      elementsPath.push('yt-horizontal-list-renderer ytd-grid-video-renderer');
      containersPath.push('yt-horizontal-list-renderer #items');
      containerId.push(-1);
      containerItem.push('ytd-grid-video-renderer');
    } else if (path.match(/^\/channel\/[^/]*\/videos$/)) {
      console.log('MATCHED CHANNEL VIDEOS');
      elementsPath.push('ytd-grid-renderer ytd-grid-video-renderer');
      containersPath.push('ytd-grid-renderer #items');
      containerId.push(0);
      containerItem.push('ytd-grid-video-renderer');
    } else if (path.match(/^\/channel\/[^/]*\/search/)) {
      // fixme: on first load - processed first 3 videos
      // fixme: didn't work on webNavigation.HistoryUpdated
      console.log('MATCHED CHANNEL SEARCH');
      elementsPath.push('ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer');
      containersPath.push('ytd-section-list-renderer > #contents');
      containerId.push(1);
      containerItem.push('ytd-item-section-renderer');
    }
  } else if (path.match(/^\/watch/)) {
    // watch
    if (path.match(/^\/watch\?.*list=/)) {
      console.log('MATCHED VIDEO WITH PLAYLIST AND RELATED');
      elementsPath.push('ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer',
          'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer');
      containersPath.push('ytd-playlist-panel-renderer #items',
          'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents');
      containerId.push(0, 0);
      containerItem.push('ytd-playlist-panel-video-renderer', 'ytd-compact-video-renderer');
    } else {
      console.log('MATCHED VIDEO WITH RELATED');
      elementsPath.push('ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer');
      containersPath.push('ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents');
      containerId.push(0);
      containerItem.push('ytd-compact-video-renderer');
    }
  } else if (path.match(/^\/playlist/)) {
    console.log('MATCHED PLAYLIST');
    elementsPath.push('ytd-playlist-video-list-renderer ytd-playlist-video-renderer');
    containersPath.push('ytd-playlist-video-list-renderer #contents');
    containerId.push(0);
    containerItem.push('ytd-playlist-video-renderer');
  } else if (path.match(/^\/feed/)) {
    // feed
    if (path.match(/^\/feed\/subscriptions$|^\/feed\/library$/)) {
      // fixme: /feed/subscriptions?flow=2 - all don't work
      // fixme: /feed/subscriptions - videos after scroll don't work
      // fixme: /feed/library - 'show more' don't work
      console.log('MATCHED FEED SUBSCRIPTIONS OR LIBRARY');
      elementsPath.push('ytd-grid-renderer ytd-grid-video-renderer');
      containersPath.push('ytd-grid-renderer #items');
      containerId.push(-1);
      containerItem.push('ytd-grid-video-renderer');
    } else if (path.match(/^\/feed\/explore$/)) {
      console.log('MATCHED FEED EXPLORE');
      elementsPath.push('ytd-expanded-shelf-contents-renderer ytd-video-renderer');
      containersPath.push('ytd-expanded-shelf-contents-renderer #grid-container');
      containerId.push(0);
      containerItem.push('ytd-video-renderer');
    } else if (path.match(/^\/feed\/history$/)) {
      // fixme: videos after scroll don't work
      console.log('MATCHED FEED HISTORY');
      elementsPath.push('ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer');
      containersPath.push('ytd-section-list-renderer > #contents');
      containerId.push(0);
      containerItem.push('ytd-item-section-renderer');
    }
  } else {
    console.log('DIDN\'T MATCH');
  }
}

/**
 * Set listeners after page load is complete.
 * @param {string} url
 * @param {string} path
 * @param {string[]} elementsPath
 * @param {string[]} containersPath
 * @param {string[]} containerId
 * @param {string[]} containerItem
 */
function setListeners(url: string, path: string, elementsPath: string[], containersPath: string[],
    containerId: number[], containerItem: string[]) {
  const elementPath = elementsPath[0] + ' ' + THUMBNAIL_PATH;
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
          processElements(elementsPath, containersPath, containerId, containerItem);
          if (path.match(/^\/watch/)) {
            processVideoPlayer(url);
          }
        }, PAGE_LOAD_TIMEOUT);
      } else {
        processElements(elementsPath, containersPath, containerId, containerItem);
        if (path.match(/^\/watch/)) {
          processVideoPlayer(url);
        }
      }
    }, PAGE_LOAD_TIMEOUT);
  } else {
    processElements(elementsPath, containersPath, containerId, containerItem);
    if (path.match(/^\/watch/)) {
      processVideoPlayer(url);
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
function processElements(elements: string[], containers: string[], containerIds: number[], containerItems: string[]) {
  for (let i = 0; i < elements.length; i++) {
    const elementPath = elements[i] + ' ' + THUMBNAIL_PATH;
    console.log('elementPath: ' + elementPath);
    const containerPath = containers[i];
    console.log('containerPath: ' + containerPath);

    const thumbnailElements: NodeListOf<HTMLElement> = document.querySelectorAll(elementPath);

    if (thumbnailElements && thumbnailElements.length) {
      for (const thumbnail of thumbnailElements) {
        processThumbnail(thumbnail);
      }

      setObserverForDynamicallyLoadedElements(i, containerPath, containerIds, containerItems);
    }
  }
}

/**
 * Set observer for dynamically loaded elements on page scroll.
 * @param {number} index
 * @param {string} containerPath
 * @param {string[]} containerIds
 * @param {string[]} containerItems
 */
function setObserverForDynamicallyLoadedElements(index: number, containerPath: string,
    containerIds: number[], containerItems: string[]) {
  const observer = new MutationObserver((mutations) => newElementsCallback(mutations, containerItems[index]));
  if (containerIds[index] > -1) {
    const container = document.querySelectorAll(containerPath)[containerIds[index]];
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

/**
 * Add checkbox to video player
 * @param {string} url
 */
function processVideoPlayer(url: string) {
  console.log('watch page URL: ' + url);
  const player: Thumbnail = document.querySelector('#primary #player') as Thumbnail;
  const videoId = new URL(url).searchParams.get('v');
  console.log('watch page videoId: ' + videoId);

  if (player.videoId) {
    player.videoId = videoId as string; // current video value
    chrome.storage.sync.get(videoId, (result: Holder) => {
      const checkbox: HTMLElement = player.querySelector('.youtube-watched-checkbox') as HTMLElement;
      if (result[videoId as string]) {
        checkbox.style.zIndex = '1000';
      } else {
        checkbox.style.zIndex = '-1000';
      }
    });
    return;
  }

  player.videoId = videoId as string;
  const checkbox = createCheckboxDiv();
  player.append(checkbox);

  updateElementsIfVideoMarkedAsWatched(videoId as string, checkbox, player, false);

  // todo: check if listeners not applied twice
  addElementsEventListeners(player, checkbox, false);
}

/**
 * Add checkbox to thumbnail, darken if selected
 * @param {Thumbnail} thumbnail
 */
function processThumbnail(thumbnail: Thumbnail) {
  if (thumbnail.videoId) {
    console.log('processing thumbnail: ' + thumbnail.videoId);
    chrome.storage.sync.get(thumbnail.videoId, (result: Holder) => {
      const checkbox: HTMLElement = thumbnail.querySelector('.youtube-watched-checkbox') as HTMLElement;
      if (result[thumbnail.videoId as string]) {
        checkbox.style.zIndex = '1000';
        thumbnail.classList.add('youtube-watched-thumbnail');
      } else {
        checkbox.style.zIndex = '-1000';
        thumbnail.classList.remove('youtube-watched-thumbnail');
      }
    });
    return; // todo: check for possible source of not processing thumbnails on some pages
  }

  const videoId = getVideoId(thumbnail);
  if (!videoId) return;
  console.log('found videoId: ' + videoId);

  thumbnail.videoId = videoId;
  const checkbox = createCheckboxDiv();
  thumbnail.append(checkbox);

  updateElementsIfVideoMarkedAsWatched(videoId, checkbox, thumbnail, true);

  // todo: check if listeners not applied twice
  addElementsEventListeners(thumbnail, checkbox, true);
}

/**
 * Get Thumbnail videoId
 * @param {Thumbnail} thumbnail
 * @return {string} videoId
 */
export function getVideoId(thumbnail: Thumbnail): string | null {
  const href = thumbnail.getAttribute('href');
  if (!href) return null;

  const url = new URL(window.location.origin + href);
  return url.searchParams.get('v');
}

/**
 * Create checkbox for toggling watched videos
 * @return {HTMLDivElement} checkbox
 */
export function createCheckboxDiv(): HTMLDivElement {
  const checkbox = document.createElement('div');
  checkbox.className = 'youtube-watched-checkbox';
  checkbox.innerHTML = 'WATCHED';
  return checkbox;
}

/**
 * Show checkbox on top of thumbnail if video is already "watched"
 * @param {string} videoId
 * @param {HTMLDivElement} checkbox
 * @param {Thumbnail} thumbnail
 * @param {boolean} changeThumbnailOpacity
 */
function updateElementsIfVideoMarkedAsWatched(videoId: string, checkbox: HTMLDivElement, thumbnail: Thumbnail,
    changeThumbnailOpacity: boolean) {
  chrome.storage.sync.get(videoId, (result: Holder) => {
    if (result[videoId]) {
      console.log('Read ' + JSON.stringify(result));
      checkbox.style.zIndex = '1000';
      if (changeThumbnailOpacity) {
        thumbnail.classList.add('youtube-watched-thumbnail');
      }
    }
  });
}

/**
 * Add mouseenter, mouseleave event listeners for Thumbnail.
 * And click event listener for checkbox
 * @param {Thumbnail} thumbnail
 * @param {HTMLDivElement} checkbox
 * @param {boolean} changeThumbnailOpacity
 */
function addElementsEventListeners(thumbnail: Thumbnail, checkbox: HTMLDivElement, changeThumbnailOpacity: boolean) {
  thumbnail.addEventListener('mouseenter', mouseEnterHandler);
  thumbnail.addEventListener('mouseleave', mouseLeaveHanlder);
  checkbox.addEventListener('click', () => clickHandler(event as Event, changeThumbnailOpacity));
}

/**
 * Handler for 'mouseenter' event
 * @param {Event} event
 */
function mouseEnterHandler(event: Event) {
  const currentThumbnail = event.currentTarget as Thumbnail;
  const checkbox: HTMLElement = currentThumbnail.querySelector('.youtube-watched-checkbox') as HTMLElement;

  chrome.storage.sync.get(currentThumbnail.videoId as string, (result: Holder) => {
    if (!result[currentThumbnail.videoId as string]) {
      checkbox.style.zIndex = '1000';
    }
  });
}

/**
 * Handler for 'mouseleave' event
 * @param {Event} event
 */
function mouseLeaveHanlder(event: Event) {
  const currentThumbnail = event.currentTarget as Thumbnail;
  const checkbox: HTMLElement = currentThumbnail.querySelector('.youtube-watched-checkbox') as HTMLElement;

  chrome.storage.sync.get(currentThumbnail.videoId as string, (result: Holder) => {
    if (!result[currentThumbnail.videoId as string]) {
      checkbox.style.zIndex = '-1000';
    }
  });
}

/**
 * Handler for 'click' event
 * @param {Event} event
 * @param {boolean} changeThumbnailOpacity
 */
function clickHandler(event: Event, changeThumbnailOpacity: boolean) {
  event.stopPropagation();
  event.preventDefault();
  event.stopImmediatePropagation();

  const currentCheckbox = event.currentTarget as HTMLElement;
  const thumbnail: Thumbnail = currentCheckbox.parentElement as Thumbnail;
  const videoId = thumbnail.videoId;

  chrome.storage.sync.get(videoId as string, (result: Holder) => {
    if (result[videoId as string]) {
      chrome.storage.sync.remove(videoId as string, () => {
        console.log('Delete ' + JSON.stringify(videoId));
      });
      currentCheckbox.style.zIndex = '-1000';
      if (changeThumbnailOpacity) {
        thumbnail.classList.remove('youtube-watched-thumbnail');
      }
    } else {
      const obj: Holder = {};
      obj[videoId as string] = 1;
      chrome.storage.sync.set(obj, () => {
        console.log('Save ' + JSON.stringify(obj));
      });
      currentCheckbox.style.zIndex = '1000';
      if (changeThumbnailOpacity) {
        thumbnail.classList.add('youtube-watched-thumbnail');
      }
    }
  });
}

/**
 * Callback for MutationObserver
 * @param {MutationRecord[]} mutations
 * @param {string} element
 */
function newElementsCallback(mutations: MutationRecord[], element: string) {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;

      if (node.matches(element)) {
        console.log('observer processing thumbnail...');
        const thumbnail: Thumbnail = node.querySelector(THUMBNAIL_PATH) as Thumbnail;
        if (thumbnail) {
          processThumbnail(thumbnail);
        }
      }
    }
  }
  // todo: on some pages (home etc - where >1 container possible) add listeners again,
  //  as not all might be loaded right away
}
