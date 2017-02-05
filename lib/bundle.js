'use strict';

import Config from './gorun-config';

async function bundle() {
  const fn = Config.bundle;

  if (!fn) {
    return;
  }

  const r = fn();

  if (r && typeof r.then === 'function') {
    await r;
  }

  return r;
}

export default bundle;
