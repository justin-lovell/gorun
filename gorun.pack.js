'use strict';


const copyJavaScript = {
  initialize: [{
    source: 'lib/**/*.js',
    destination: 'dist'
  }],
  transform: require('./lib/transform-babel')
};

const copyPackageJson = {
  initialize: [{
    source:'package.json',
    destination: 'dist'
  }]
};

export default {
  directoriesToClean: () => [
    'dist/*'
  ],
  copy: [
    copyJavaScript,
    copyPackageJson
  ]
};
