'use strict';

import type Promise from 'bluebird';
import type {ReadStream,WriteStream} from 'fs';

import Path from 'path';
import FileSystem from 'fs';
import AppRootPath from 'app-root-path';


export type ArrayOrFuncArray<T> = Array<T> | (() => Array<T>) | null;
export type SourceDestination = { source: string, destination: string };


let fullConfigPath = Path.join(AppRootPath.toString(), 'gorun.pack.js');
let config : {
  directoriesToClean: ArrayOrFuncArray<string>,
  copy: null | Array<{
    initialize: ArrayOrFuncArray<SourceDestination>,
    monitor: ArrayOrFuncArray<SourceDestination>,
    transform: null | ((readStream: ReadStream, writeStream: WriteStream, file: {name: string}) => void)
  }>,
  bundle: null | (() => void) | (() => Promise<any>)
} = {
  directoriesToClean: null,
  copy: null,
  bundle: null
};

if (FileSystem.existsSync(fullConfigPath)) {
  let importedConfig = require(fullConfigPath);
  importedConfig = importedConfig.default || importedConfig;
  Object.assign(config, importedConfig);
}


export default config;
