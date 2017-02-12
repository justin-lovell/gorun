
'use strict';

import type {SourceDestination} from './gorun-config';

import Path from 'path';
import FileSystem from 'fs';
import Gaze from 'gaze';
import AppRootPath from 'app-root-path';
import Promise from 'bluebird';

import Config from './gorun-config';


const Ncp = Promise.promisify(require('ncp'));
const Del = Promise.promisify(require('del'));
const Glob = Promise.promisify(require('glob'));




function determineSourceRelativeRoot(sourcePath) {

  let currentPath = [];

  let pathsToTraverse = sourcePath.split('/');
  pathsToTraverse = pathsToTraverse.slice(0, pathsToTraverse.length - 1);

  for (let part of pathsToTraverse) {
    if (part.indexOf('*') >= 0) {
      break;
    }

    currentPath.push(part);
  }

  return currentPath.join('/') + '/';

}

function ensureDirectoryExists(path) {
  const current = Path.dirname(path);

  if (!FileSystem.existsSync(current)) {
    ensureDirectoryExists(current);
    FileSystem.mkdirSync(current);
  }
}

async function performCopy(filename, pathToCopyOver, ncpOptions) {

  ensureDirectoryExists(pathToCopyOver);
  await Ncp(filename, pathToCopyOver, ncpOptions);

}


async function activelyWatchForContentChanges(config, paths: Array<SourceDestination>) {

  const rootPath = AppRootPath.toString();

  await Promise.all(
    paths.map(path => {

      let sourcePath = Path.join(rootPath, path.source);
      let destinationPath = Path.join(rootPath, path.destination);

      return createGazeWatch(rootPath, sourcePath, destinationPath);

    })
  );

  function createGazeWatch(rootPath, sourcePath, destinationPath) {

    let sourceRootPath = determineSourceRelativeRoot(sourcePath);

    return new Promise((resolve, reject) =>

      Gaze(sourcePath, (err, val) => err ? reject(err) : resolve(val))

    ).then(watcher => {

      watcher.on('added', copyFileToDestination);
      watcher.on('changed', copyFileToDestination);
      watcher.on('deleted', removeFileFromDestination);

    });


    async function copyFileToDestination(filename) {

      const relativePath = filename.substr(sourceRootPath.length);
      const pathToCopyOver = Path.join(rootPath, destinationPath, relativePath);
      const ncpOptions = {
        transform: config && config.transform
      };

      await performCopy(filename, pathToCopyOver, ncpOptions);

    }

    async function removeFileFromDestination(filename) {

      const relativePath = filename.substr(sourceRootPath.length);
      const pathToDelete = Path.join(rootPath, destinationPath, relativePath);

      await Del(pathToDelete);

    }

  }

}


function exposeItemAsArray(input: any): Array<SourceDestination> {
  let arr = input || [];

  if (typeof arr === 'function') {
    arr = arr();
  }

  return arr;
}


async function performInitialCopy(config, ...arrays) {

  const rootPath = AppRootPath.toString();
  const ncpOptions = {
    transform: config && config.transform
  };

  const p = arrays.reduce((a, b) => a.concat(b), [])
    .map(x => {
      const source = Path.join(rootPath, x.source);
      const destination = Path.join(rootPath, x.destination);
      const sourceRootPath = determineSourceRelativeRoot(source);

      return Glob(source, {}).then(files => {

        const copy = (files || []).map(async (filename) => {

          const relativePath = filename.substr(sourceRootPath.length);
          const pathToCopyOver = Path.join(destination, relativePath);

          await performCopy(filename, pathToCopyOver, ncpOptions);

        });

        return Promise.all(copy);

      });

    });

  await Promise.all(p);
}


async function copy({ watch } : {watch: boolean} = { watch: false }) {

  if (Config.copy) {
    let items = Config.copy.map(async (configItem) => {

      const copyAcross = exposeItemAsArray(configItem && configItem.initialize);
      const monitor = exposeItemAsArray(configItem && configItem.monitor);

      await performInitialCopy(configItem, copyAcross, monitor);

      if (watch && monitor && monitor.length) {
        await activelyWatchForContentChanges(configItem, monitor);
      }

    });

    await Promise.all(items);
  }

}


export default copy;
