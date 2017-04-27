import _ from "lodash";
import settings from "./settings";
import Worker from "./worker/magellan";

const BaseTest = function (steps, customizedSettings = null) {
  /**
   * NOTICE: we don't encourage to pass [before, beforeEach, afterEach, after]
   *         together with steps into the constructor. PLEASE extend the base test
   *         and define these four methods there if they are necessary
   */
  const self = this;
  const enumerables = ["before", "after", "beforeEach", "afterEach"];

  this.isWorker = settings.isWorker;
  this.env = settings.env;

  if (customizedSettings) {
    this.isWorker = customizedSettings.isWorker;
    this.env = customizedSettings.env;
  }

  // copy steps to self
  _.forEach(steps, (v, k) => {
    Object.defineProperty(self, k,
      { enumerable: true, value: v });
  });

  // copy before, beforeEach, afterEach, after to prototype
  _.forEach(enumerables, (k) => {
    const srcFn = self[k] || BaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k,
        { enumerable: true, value: srcFn });
    }
  });
};

BaseTest.prototype = {
  /*eslint-disable callback-return*/
  before(client, callback) {
    this.failures = [];
    this.passed = 0;

    // we only want timeoutsAsyncScript to be set once the whole session to limit
    // the number of http requests we sent
    this.isAsyncTimeoutSet = false;
    this.isSupposedToFailInBefore = false;

    if (this.isWorker) {
      this.worker = new Worker({ nightwatch: client });
      process.addListener("message", this.worker.handleMessage);
    }
    callback();
  },

  beforeEach(client) {
    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;

      if (this.isWorker) {
        this.worker.emitSession(client.sessionId);
      }
    }
  },

  afterEach(client, callback) {
    if (this.results) {
      // in case we failed in `before`
      // keep track of failed tests for reporting purposes
      if (this.results.failed || this.results.errors) {
        // Note: this.client.currentTest.name is also available to display
        // the name of the specific step within the test where we've failed.
        this.failures.push(client.currentTest.module);
      }

      if (this.results.passed) {
        this.passed += this.results.passed;
      }
    }

    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;

      if (this.isWorker) {
        this.worker.emitSession(client.sessionId);
      }
    }

    callback();
  },

  /*eslint-disable callback-return*/
  after(client, callback) {
    const self = this;

    if (this.isWorker) {
      process.removeListener("message", self.worker.handleMessage);
    }

    if (self.isSupposedToFailInBefore) {
      // there is a bug in nightwatch that if test fails in `before`, test
      // would still be reported as passed with a exit code = 0. We'll have
      // to let magellan know the test fails in this way
      /* istanbul ignore next */
      /*eslint no-process-exit:0 */
      /*eslint no-magic-numbers:0 */
      process.exit(100);
    }
    // executor should eat it's own error in summerize()

    client.end();
    callback();

  }
};

module.exports = BaseTest;
