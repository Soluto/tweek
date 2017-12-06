const nconf = require('nconf');
nconf
  .argv()
  .env()
  .defaults({
    EDITOR_URL: 'http://localhost:4004/',
    TWEEK_API_URL: 'http://localhost:4003/',
    AUTHORING_URL: 'http://localhost:4005/',
    GIT_PRIVATE_KEY_PATH: '../../deployments/dev/ssh/tweekgit',
  });
const host = nconf.get('host');
const proxy = nconf.get('proxy');

const workingDirectory = process.cwd().replace(/\\/g, '/');

function removeTrailingSlashes(url) {
  return url.endsWith('/') ? removeTrailingSlashes(url.substring(0, url.length - 1)) : url;
}

exports.config = {
  specs: ['./spec/**/*.js'],
  exclude: [],
  maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [
    {
      // maxInstances can get overwritten per capability. So if you have an in-house Selenium
      // grid with only 5 firefox instance available you can make sure that not more than
      // 5 instance gets started at a time.
      // maxInstances: 5,
      //
      proxy: {
        httpProxy: proxy,
        sslProxy: proxy,
        ftpProxy: proxy,
        proxyType: proxy == null ? 'SYSTEM' : 'MANUAL',
        autodetect: false,
      },
      browserName: 'chrome',
      chromeOptions: { args: ['--no-sandbox'] },
      unexpectedAlertBehaviour: 'accept',
    },
  ], // host: 'http://localhost',
  // port: 8080,
  sync: true,
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'error',
  coloredLogs: true,
  // Saves a screenshot to a given path if a command fails.
  //screenshotPath: '/mnt/errorShots',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", then the base url gets prepended.
  baseUrl: removeTrailingSlashes(nconf.get('EDITOR_URL')),
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  connectionRetryTimeout: 60000,
  //
  // Default request retries count
  connectionRetryCount: 2,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should have the
  // plugin name as key and the desired plugin options as properties. Make sure you have
  // the plugin installed before running any tests. The following plugins are currently
  // available:
  // WebdriverCSS: https://github.com/webdriverio/webdrivercss
  // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
  // Browserevent: https://github.com/webdriverio/browserevent
  // plugins: {
  //     webdrivercss: {
  //         screenshotRoot: 'my-shots',
  //         failedComparisonsRoot: 'diffs',
  //         misMatchTolerance: 0.05,
  //         screenWidth: [320,480,640,1024]
  //     },
  //     webdriverrtc: {},
  //     browserevent: {}
  // },
  services: host ? [] : ['selenium-standalone'],
  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  framework: 'mocha',
  //
  // Test reporter for stdout. see also: http://webdriver.io/guide/testrunner/reporters.html
  reporters: ['spec'],
  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  // mochaOpts: {
  //   compilers: ['js:babel-register'],
  // },
  mochaOpts: {
    ui: 'bdd',
    compilers: ['js:babel-register'],
    timeout: 99999999,
  },
  onPrepare: async () => {
    const { waitForAllClients } = require(workingDirectory + '/utils/client-utils.js');
    await waitForAllClients();

    console.log('ready');
  },
  onComplete: () => {
    console.log('completed');
  },
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  //
  // Gets executed once before all workers get launched.
  // onPrepare: function (config, capabilities) {
  // },
  //
  // Gets executed before test execution begins. At this point you can access all global
  // variables, such as `browser`. It is the perfect place to define custom commands.
  before: function() {
    const chai = require('chai');
    chai.use(require('chai-string'));

    const browserExtentionCommands = require(workingDirectory +
      '/utils/browser-extension-commands');
    browserExtentionCommands(browser);
  },
  //
  // Hook that gets executed before the suite starts
  // beforeSuite: function (suite) {
  // },
  //
  // Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
  // beforeEach in Mocha)
  // beforeHook: function () {
  // },
  //
  // Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
  // afterEach in Mocha)
  // afterHook: function () {
  // },
  //
  // Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
  // beforeTest: function (test) {
  // },
  //
  // Runs before a WebdriverIO command gets executed.
  // beforeCommand: function (commandName, args) {
  // },
  //
  // Runs after a WebdriverIO command gets executed
  // afterCommand: function (commandName, args, result, error) {
  // },
  //
  // Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
  // afterTest: function (test) {
  // },
  //
  // Hook that gets executed after the suite has ended
  // afterSuite: function (suite) {
  // },
  //
  // Gets executed after all tests are done. You still have access to all global variables from
  // the test.
  // after: function (result, capabilities, specs) {
  // },
  //
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  // onComplete: function(exitCode) {
  // }
};
