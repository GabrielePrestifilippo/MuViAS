
module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      'test-main.js',
      {pattern: 'test/**/*.js', included: false},
      {pattern: './scripts/*.js', included: false},
    ],

    exclude: [
    ],

    preprocessors: {
    },
    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false,

    concurrency: Infinity
  })
}
