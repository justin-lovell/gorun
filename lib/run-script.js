'use strict';

import ChildProcess from 'child_process';
import Config from './gorun-config';

let currentProcess;

function runScript(cb?: (err: any, data?: any) => void) {

  if (currentProcess) {
    currentProcess.kill('SIGTERM');
  }


  const scriptPath = Config && Config.script && Config.script.path;
  const runningRegex = Config && Config.script && Config.script.runningRegex;

  if (!scriptPath || !scriptPath.length) {
    const err = new Error('gorun.pack.js does not have script.path property set');

    if (cb) return cb(err);
    else throw err;
  }

  currentProcess =
    ChildProcess.spawn('node', [scriptPath],
      {
        env: Object.assign({NODE_ENV: 'development'}, process.env),
        silent: false
      });

  currentProcess.stdout.on('data', onStdOut);
  currentProcess.stderr.on('data', x => process.stderr.write(x));


  function onStdOut(data) {
    let match = [null, null];

    if (runningRegex) {
      const time = new Date().toTimeString();

      match = data.toString('utf8').match(runningRegex);

      process.stdout.write(time.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '[$1] '));
      process.stdout.write(data);
    }

    if (match) {
      currentProcess.stdout.removeListener('data', onStdOut);
      currentProcess.stdout.on('data', x => process.stdout.write(x));

      if (!runningRegex) {
        process.stdout.write(data);
      }

      if (cb) {
        cb(null, match[1]);
      }
    }
  }

}

process.on('exit', () => {
  if (currentProcess) {
    currentProcess.kill('SIGTERM');
  }
});

export default runScript;
