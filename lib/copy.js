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

  for (const path of paths) {
    const sourcePath = Path.join(rootPath, path.source);
    const destinationPath = Path.join(rootPath, path.destination);

    await createGazeWatch(rootPath, sourcePath, destinationPath);
  }


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


async function performInitialCopy(config, paths) {

  const rootPath = AppRootPath.toString();
  const ncpOptions = {
    transform: config && config.transform
  };

  for (const path of paths) {
    const source = Path.join(rootPath, path.source);
    const destination = Path.join(rootPath, path.destination);
    const sourceRootPath = determineSourceRelativeRoot(source);

    await Glob(source, {}).then(async files => {

      for (const filename of files) {

        const relativePath = filename.substr(sourceRootPath.length);
        const pathToCopyOver = Path.join(destination, relativePath);

        await performCopy(filename, pathToCopyOver, ncpOptions);
      }

    });
  }

}


async function copy({watch} : {watch: boolean} = {watch: false}) {

  if (Config.copy) {
    for (const configItem of Config.copy) {
      const copyAcrossPaths = exposeItemAsArray(configItem && configItem.initialize);
      const monitorPaths = exposeItemAsArray(configItem && configItem.monitor);

      await performInitialCopy(configItem, copyAcrossPaths);
      await performInitialCopy(configItem, monitorPaths);

      if (watch && monitorPaths && monitorPaths.length) {
        await activelyWatchForContentChanges(configItem, monitorPaths);
      }
    }
  }

}


export default copy;
