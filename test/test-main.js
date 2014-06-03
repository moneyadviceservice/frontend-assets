var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function (path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start,
  paths: {
    MASModule: 'js/lib/MASModule',
    panels: 'js/components/panels',
    jquery: 'vendor/assets/bower_components/jquery/dist/jquery',
    eventsWithPromises: 'vendor/assets/bower_components/eventsWithPromises/src/eventsWithPromises',
    rsvp: 'vendor/assets/bower_components/rsvp/rsvp.amd',
    utilities: 'js/lib/utilities'
  }

});