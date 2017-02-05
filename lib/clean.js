'use strict';

import Del from 'del';
import Config from './gorun-config';

async function clean() {
  let dirs = Config.directoriesToClean || [];

  if (typeof dirs === 'function') {
    dirs = dirs();
  }

  await Del(dirs, {dot: true});
}

export default clean;
