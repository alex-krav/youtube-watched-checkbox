'use strict';

import * as chai from 'chai';

const chrome = require('sinon-chrome/extensions');
global.chrome = chrome;

require('jsdom-global')();

import {setElementSelectors} from '../scripts/content';


describe('setElementSelectors', function() {
  it('homepage', function() {
    const path = '/';
    const elementsPath: string[] = [];
    const containersPath: string[] = [];
    const containerId: number[] = [];
    const containerItem: string[] = [];

    setElementSelectors(path, elementsPath, containersPath, containerId, containerItem);

    chai.expect(elementsPath).length(1);
    chai.expect(elementsPath).contain('ytd-rich-grid-renderer ytd-rich-item-renderer ytd-rich-grid-media');
    chai.expect(containersPath).length(1);
    chai.expect(containersPath).contain('ytd-rich-grid-renderer #contents');
    chai.expect(containerId).length(1);
    chai.expect(containerId).contain(0);
    chai.expect(containerItem).length(1);
    chai.expect(containerItem).contain('ytd-rich-item-renderer');
  });
});
