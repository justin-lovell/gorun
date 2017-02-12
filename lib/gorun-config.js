'use strict';

import type Promise from 'bluebird';
import type {ReadStream,WriteStream} from 'fs';

import Path from 'path';
import FileSystem from 'fs';
import AppRootPath from 'app-root-path';


export type ArrayOrFuncArray<T> = Array<T> | (() => Array<T>);
export type SourceDestination = { source: string, destination: string };


let fullConfigPath = Path.join(AppRootPath.toString(), 'gorun.pack.js');
let config : {
  directoriesToClean?: ArrayOrFuncArray<string>,
  copy?: Array<{
    initialize?: ArrayOrFuncArray<SourceDestination>,
    monitor?: ArrayOrFuncArray<SourceDestination>,
    transform?: ((readStream: ReadStream, writeStream: WriteStream, file: {name: string}) => void)
  }>,
  bundle?: (() => void) | (() => Promise<any>),
  script?: {
    runningRegex?: any,
    path?: string
  },
  startAndMonitorPaths?: ArrayOrFuncArray<string>
} = {};

if (FileSystem.existsSync(fullConfigPath)) {
  let importedConfig = require(fullConfigPath);
  importedConfig = importedConfig.default || importedConfig;
  Object.assign(config, importedConfig);
}


export default config;
