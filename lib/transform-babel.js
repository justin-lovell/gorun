'use strict';

import type {ReadStream,WriteStream} from 'fs';

import through2 from 'through2';
import { transform } from 'babel-core';


module.exports = (readStream: ReadStream, writeStream: WriteStream) => {

  readStream.pipe(through2(

    function(chunk, enc, callback) {

      const originalCode = chunk.toString();
      const options = {
        ast: false,
        sourceMaps: 'inline',
        presets: [
          "es2015",
          "stage-0"
        ],
        plugins: [
          "transform-runtime",
          "transform-flow-strip-types"
        ]
      };
      const transformed = transform(originalCode, options);

      this.push(transformed.code);

      callback();

    }

  )).pipe(writeStream);

};
