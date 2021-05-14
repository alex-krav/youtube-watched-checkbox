'use strict';

import * as fs from 'fs';
import * as path from 'path';
const ChromeExtension = require('crx');

const crx = new ChromeExtension({
  codebase: 'http://localhost:8000/youtube-watched-checkbox.crx',
  privateKey: fs.readFileSync('./key.pem'),
});

crx.load( path.resolve(__dirname, '../dist') )
    .then((crx: any) => crx.pack())
    .then((crxBuffer: any) => {
      fs.writeFile('./dist/youtube-watched-checkbox.crx', crxBuffer, function() {});
    })
    .catch((err: Error)=>{
      console.error( err );
    });
