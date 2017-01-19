// Base test class that should be used for all Magellan tests
//
// Exposes a before/after function that are run *per-file*

var sauce = require("./util/sauce"),
  SessionAcquisitionWrapper = require("./selenium-session-acquisition-wrapper"),
  clc = require("cli-color"),
  Q = require("q"),
  settings = require("./settings.js");

var closeSession = function (client) {

  var deferred = Q.defer();

  client.end();
  deferred.resolve();
  return deferred.promise;
};

var updateSauceStats = function (client, numFailures) {

  var deferred = Q.defer();

  if (sauce.isSauceTest(client)) {
    console.info("Test video at: " + sauce.getTestUrl());
    sauce.updateStats(client, numFailures, deferred.resolve);
  } else {
    deferred.resolve();
  }

  return deferred.promise;
};

var emitStartedTest = function (client) {
  if (settings.isWorker === true) {
    var testName = client.currentTest.module;

    // Note: This is for Magellan versions earlier than 8 and will be ignored by
    // magellan versions 8 and above.
    if (process.send) {
      process.send({
        type: "worker-status",
        status: "started",
        name: testName
      });
    }
  }
};

var emitFinishedTest = function (client, numFailures) {

  if (settings.isWorker === true) {
    var testName = client.currentTest.module;
    if (process.send) {
      process.send({
        type: "worker-status",
        status: "finished",
        name: testName,
        passed: (numFailures === 0) ? true : false,
        metadata: {
          resultURL: sauce.getTestUrl(client),
          // Note: browserErrors has been deprecated, but we don't want to regress
          // versions of magellan that consume this property, so we pass it along.
          browserErrors: []
        }
      });
    }
  }

  var deferred = Q.defer();
  deferred.resolve();
  return deferred.promise;
};

var MagellanBaseTest = function (steps, customized_settings) {
  var self = this;
  var enumerables = ["before", "after", "beforeEach", "afterEach"];

  this.isWorker = settings.isWorker;
  this.env = settings.env;

  if (customized_settings) {
    this.isWorker = customized_settings.isWorker;
    this.env = customized_settings.env
  }
  // Add step wrapper to capture selenium session id
  SessionAcquisitionWrapper.initialize(this, steps);

  // copy incoming steps onto self
  Object.keys(steps).forEach(function (k) {
    if (typeof steps[k] === "function") {
      Object.defineProperty(self, k, { enumerable: true, value: steps[k].bind(self) });
    } else {
      Object.defineProperty(self, k, { enumerable: true, value: steps[k] });
    }
  });

  enumerables.forEach(function (k) {
    var srcFn = self[k] || MagellanBaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k, { enumerable: true, value: srcFn });
    }
  });
};

MagellanBaseTest.prototype = {
  before: function (client) {
    this.isSupposedToFailInBefore = false;
    this.failures = [];
    this.passed = 0;
    this.notifiedListenersOfStart = false;

    // we only want timeoutsAsyncScript to be set once the whole session to limit 
    // the number of http requests we sent
    this.isAsyncTimeoutSet = false;
  },

  /*
   * Runs at the beginning of each step
   */
  beforeEach: function (client) {

    // Tell reporters that we are starting this test.
    // This logic would ideally go in the "before" block and not "beforeEach"
    // but Nightwatch does not give us access to the module (file) name in the
    // "before" block, so we have to put it here (hence the `notifiedListenersOfStart`
    // flag, so that we only perform this update once per-file.)
    if (!this.notifiedListenersOfStart) {
      emitStartedTest(client);

      if (settings.isWorker === true) {
        this.handleExternalMessage = function (message) {
          if (message && message.signal === "bail") {
            client.assert.equal(false, true, message.customMessage || "Test killed.");
          }
        };
        process.addListener("message", this.handleExternalMessage);
      }

      this.notifiedListenersOfStart = true;
    }
    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;
    }

    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }
  },

  /*
   * Runs at the beginning of each step
   */
  afterEach: function (client, callback) {
    if (this.results) {
      // in case we failed in `before`
      // keep track of failed tests for reporting purposes
      if (this.results.failed || this.results.errors) {
        // Note: client.currentTest.name is also available to display
        // the name of the specific step within the test where we've failed.
        this.failures.push(client.currentTest.module);
      }

      if (this.results.passed) {
        this.passed += this.results.passed;
      }
    }
    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;
    }

    if (!this.isAsyncTimeoutSet) {
      var self = this;
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      self.isAsyncTimeoutSet = true;
    }

    callback();

  },

  /*
   * Runs at the end of each file
   */
  after: function (client, callback) {
    var self = this;

    var numFailures = self.failures.length;
    var totalTests = self.passed + self.failures.length;

    if (settings.isWorker === true && this.handleExternalMessage) {
      process.removeListener("message", this.handleExternalMessage);
    }


    emitFinishedTest(client, numFailures)
      .then(function () {
        return updateSauceStats(client, numFailures);
      })
      .then(function () {
        return closeSession(client);
      })
      .then(function () {
        if (self.isSupposedToFailInBefore) {
          // there is a bug in nightwatch that if test fails in `before`, test
          // would still be reported as passed with a exit code = 0. We'll have 
          // to let magellan know the test fails in this way 
          process.exit(100);
        }
        callback();
      });
  }
};

module.exports = MagellanBaseTest;
