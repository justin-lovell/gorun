'use strict';

import Run from './run';
import RunScript from './run-script';
import Clean from './clean';
import Copy from './copy';
import Bundle from './bundle';

import Config from './gorun-config';

import Gaze from 'gaze';


function exposeItemAsArray(input: any): Array<string> {
  let arr = input || [];

  if (typeof arr === 'function') {
    arr = arr();
  }

  return arr;
}

async function start() {

  await Run(Clean);
  await Run(Copy, {watch: true});

  await new Promise(async(resolve, reject) => {

    await bundleAndRun();

    exposeItemAsArray(Config.startAndMonitorPaths).map(path => {
      new Promise((resolve, reject) =>

        Gaze(path, (err, val) => err ? reject(err) : resolve(val))
      ).then(watcher =>

        watcher.on('all', async() => await bundleAndRun())
      )
    });

    async function bundleAndRun() {

      await Run(Bundle).catch(reject);
      RunScript();

    }

  });
}

export default start;
