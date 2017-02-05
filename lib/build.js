'use strict';

import Run from './run';
import Clean from './clean';
import Copy from './copy';
import Bundle from './bundle';
import Promise from 'bluebird';

async function build() {
  await Run(Clean);

  await Promise.all([
    Run(Copy),
    Run(Bundle)
  ]);
}

export default build;
