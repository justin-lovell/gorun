'use strict';

export default {
  directoriesToClean: () => [
    'dist/*'
  ],
  copy: [
    {
      initialize: [{
        source: 'lib/**/*.js',
        destination: 'dist'
      }],
      transform: require('./lib/transform-babel')
    }
  ]
};
