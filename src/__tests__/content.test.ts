'use strict';

import * as chai from 'chai';

const chrome = require('sinon-chrome/extensions');
global.chrome = chrome;

require('jsdom-global')();

import {
  Thumbnail,
  createCheckboxDiv,
  getVideoId,
  setElementSelectors,
} from '../content';

let elementsPath: string[] = [];
let containersPath: string[] = [];
let containerId: number[] = [];
let containerItem: string[] = [];

describe('setElementSelectors', function() {
  beforeEach(function() {
    elementsPath = [];
    containersPath = [];
    containerId = [];
    containerItem = [];
  });

  it('homepage', function() {
    setElementSelectors('/', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-rich-grid-renderer ytd-rich-item-renderer ytd-rich-grid-media'],
        ['ytd-rich-grid-renderer #contents'],
        [0],
        ['ytd-rich-item-renderer']);
  });

  it('search results page', function() {
    setElementSelectors('/results', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer',
      'ytd-vertical-list-renderer ytd-video-renderer'],
    ['ytd-section-list-renderer > #contents', 'ytd-vertical-list-renderer > #items'],
    [2, 0],
    ['ytd-item-section-renderer', 'ytd-video-renderer']);
  });

  it('user homepage', function() {
    setElementSelectors('/user/USER_ID', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['yt-horizontal-list-renderer ytd-grid-video-renderer'],
        ['yt-horizontal-list-renderer #items'],
        [-1],
        ['ytd-grid-video-renderer']);
  });

  it('user videos page', function() {
    setElementSelectors('/c/USER_ID/videos', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-grid-renderer ytd-grid-video-renderer'],
        ['ytd-grid-renderer #items'],
        [0],
        ['ytd-grid-video-renderer']);
  });

  it('user search page', function() {
    setElementSelectors('/c/USER_ID/search', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'],
        ['ytd-section-list-renderer > #contents'],
        [1],
        ['ytd-item-section-renderer']);
  });

  it('channel home page', function() {
    setElementSelectors('/channel/CHANNEL_ID', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['yt-horizontal-list-renderer ytd-grid-video-renderer'],
        ['yt-horizontal-list-renderer #items'],
        [-1],
        ['ytd-grid-video-renderer']);
  });

  it('channel videos page', function() {
    setElementSelectors('/channel/CHANNEL_ID/videos', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-grid-renderer ytd-grid-video-renderer'],
        ['ytd-grid-renderer #items'],
        [0],
        ['ytd-grid-video-renderer']);
  });

  it('channel search page', function() {
    setElementSelectors('/channel/CHANNEL_ID/search', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'],
        ['ytd-section-list-renderer > #contents'],
        [1],
        ['ytd-item-section-renderer']);
  });

  it('watch page with playlist', function() {
    setElementSelectors('/watch?v=VIDEO_ID&list=LIST_ID', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer',
      'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer'],
    ['ytd-playlist-panel-renderer #items',
      'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents'],
    [0, 0],
    ['ytd-playlist-panel-video-renderer', 'ytd-compact-video-renderer']);
  });

  it('watch page with related videos', function() {
    setElementSelectors('/watch?v=VIDEO_ID', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-playlist-panel-renderer ytd-playlist-panel-video-renderer',
      'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer ytd-compact-video-renderer'],
    ['ytd-playlist-panel-renderer #items',
      'ytd-watch-next-secondary-results-renderer ytd-item-section-renderer #contents'],
    [0, 0],
    ['ytd-playlist-panel-video-renderer', 'ytd-compact-video-renderer']);
  });

  it('playlist page', function() {
    setElementSelectors('/playlist', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-playlist-video-list-renderer ytd-playlist-video-renderer'],
        ['ytd-playlist-video-list-renderer #contents'],
        [0],
        ['ytd-playlist-video-renderer']);
  });

  it('subscriptions page', function() {
    setElementSelectors('/feed/subscriptions', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-grid-renderer ytd-grid-video-renderer'],
        ['ytd-grid-renderer #items'],
        [-1],
        ['ytd-grid-video-renderer']);
  });

  it('explore page', function() {
    setElementSelectors('/feed/explore', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-expanded-shelf-contents-renderer ytd-video-renderer'],
        ['ytd-expanded-shelf-contents-renderer #grid-container'],
        [0],
        ['ytd-video-renderer']);
  });

  it('history page', function() {
    setElementSelectors('/feed/history', elementsPath, containersPath, containerId, containerItem);

    assertElementSelectors(['ytd-section-list-renderer ytd-item-section-renderer ytd-video-renderer'],
        ['ytd-section-list-renderer > #contents'],
        [0],
        ['ytd-item-section-renderer']);
  });
});

describe('util functions', function() {
  it('createCheckboxDiv', function() {
    const checkbox = createCheckboxDiv();

    chai.expect(checkbox.tagName).equal('DIV');
    chai.expect(checkbox.className).equal('youtube-watched-checkbox');
    chai.expect(checkbox.innerHTML).equal('WATCHED');
  });

  it('getVideoId', function() {
    const url = 'http://dummy.com';
    Object.defineProperty(window, 'location', {
      value: {
        origin: url,
      },
    });
    const thumbnail = <Thumbnail>{
      getAttribute(qualifiedName: string): string | null {
        return '/watch?v=12345';
      },
    };

    const videoId = getVideoId(thumbnail);

    chai.expect(videoId).equal('12345');
  });
});

/**
 * Assertion function for 'setElementSelectors' test
 * @param {string[]} expectedElementsPath elementsPath
 * @param {string[]} expectedContainersPath containersPath
 * @param {string[]} expectedContainerId containerId
 * @param {string[]} expectedContainerItem containerItem
 */
export function assertElementSelectors(expectedElementsPath: string[], expectedContainersPath: string[],
    expectedContainerId: number[], expectedContainerItem: string[]) {
  chai.expect(elementsPath).length(expectedElementsPath.length);
  chai.expect(elementsPath).eql(expectedElementsPath);

  chai.expect(containersPath).length(expectedContainersPath.length);
  chai.expect(containersPath).eql(expectedContainersPath);

  chai.expect(containerId).length(expectedContainerId.length);
  chai.expect(containerId).eql(expectedContainerId);

  chai.expect(containerItem).length(expectedContainerItem.length);
  chai.expect(containerItem).eql(expectedContainerItem);
}
