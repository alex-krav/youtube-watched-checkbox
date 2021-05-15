'use strict';

const crx3 = require('crx3');

crx3(['./dist/manifest.json'], {
  keyPath: './key.pem',
  crxPath: './youtube-watched-checkbox.crx',
  crxURL: 'http://127.0.0.1:8080/youtube-watched-checkbox.crx',
})
    .then(() => console.log('done'))
    .catch(console.error)
;
