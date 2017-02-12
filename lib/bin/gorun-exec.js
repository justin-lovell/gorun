#!/usr/bin/env node

'use strict';

require('babel-core/register');

import Path from 'path';
import AppRootPath from 'app-root-path';
import Run from '../run';

let moduleToRequire = process.argv[process.argv.length - 1];
const localBitPath = './';

if (moduleToRequire.startsWith(localBitPath)) {
  let pathToFollow = moduleToRequire.substr(localBitPath.length);
  moduleToRequire = Path.join(AppRootPath.toString(), pathToFollow);
}

const module = require(moduleToRequire);
Run(module).catch(err => console.error(err.stack));
