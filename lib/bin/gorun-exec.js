'use strict';

import Path from 'path';
import AppRootPath from 'app-root-path';
import Run from '../run';

const partToExecute = process.argv[process.argv.length - 1];
const module = require(Path.join(AppRootPath.toString(), partToExecute));

Run(module).catch(err => console.error(err.stack));
