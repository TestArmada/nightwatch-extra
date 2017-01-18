"use strict";

import clc from "cli-color";
import Promise from "bluebird";
import _ from "lodash";
import settings from "./settings";
import Worker from "./worker/magellan";
import ExecutorFactory from "./executor/factory";


let BaseTest = function (steps, customized_settings = null) {
  /**
   * NOTICE: we don't encourage to pass [before, beforeEach, afterEach, after]
   *         together with steps into the constructor. PLEASE extend the base test
   *         and define these four methods there if they are necessary
   */
  let self = this;
  let enumerables = ["before", "after", "beforeEach", "afterEach"];

  this.isWorker = settings.isWorker;
  this.env = settings.env;

  if (customized_settings) {
    this.isWorker = customized_settings.isWorker;
    this.env = customized_settings.env
  }

  // copy steps to self
  _.forEach(steps, (v, k) => {
    Object.defineProperty(self, k,
      { enumerable: true, value: v });
  });

  let executor = new ExecutorFactory(this.env);
  this.executorCreateMetaData = executor.createMetaData;
  this.executorSummerize = executor.summerize;

  // copy before, beforeEach, afterEach, after to prototype
  _.forEach(enumerables, (k) => {
    let srcFn = self[k] || BaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k,
        { enumerable: true, value: srcFn });
    }
  });

  // remove methods from nightwatch scan
  Object.defineProperty(self, "executorCreateMetaData",
    { enumerable: false, value: this.executorCreateMetaData });

  Object.defineProperty(self, "executorSummerize",
    { enumerable: false, value: this.executorSummerize });
};

BaseTest.prototype = {
  before: function (client) {
    this.failures = [];
    this.passed = 0;

    // we only want timeoutsAsyncScript to be set once the whole session to limit 
    // the number of http requests we sent
    this.isAsyncTimeoutSet = false;

    this.notifiedListenersOfStart = false;

    this.isSupposedToFailInBefore = false;

    if (this.isWorker) {
      this.worker = new Worker({ nightwatch: client });
    }
  },

  beforeEach: function (client) {
    // Tell reporters that we are starting this test.
    // This logic would ideally go in the "before" block and not "beforeEach"
    // but Nightwatch does not give us access to the module (file) name in the
    // "before" block, so we have to put it here (hence the `notifiedListenersOfStart`
    // flag, so that we only perform this update once per-file.)
    if (!this.notifiedListenersOfStart && this.isWorker) {
      this.worker.emitTestStart(client.currentTest.module);
      process.addListener("message", this.worker.handleMessage);
      this.notifiedListenersOfStart = true;
    }

    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;
      this.worker.emitSession(client.sessionId);
    }
  },

  afterEach: function (client, callback) {
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
    }

    callback();
  },

  after: function (client, callback) {
    let self = this;
    let numFailures = self.failures.length;
    let totalTests = self.passed + self.failures.length;

    if (this.isWorker) {
      self.worker.emitTestStop({
        testName: client.currentTest.module,
        testResult: numFailures === 0,
        metaData: this.executorCreateMetaData({ sessionId: client.sessionId })
      });

      process.removeListener("message", self.worker.handleMessage);
    }


    // executor should eat it's own error in summerize()
    this
      .executorSummerize({
        magellanBuildId: process.env.MAGELLAN_BUILD_ID,
        testResult: numFailures === 0,
        options: client.options
      })
      .then(() => {
        // end nightwatch session explicitly
        client.end();
        return Promise.resolve();
      })
      .then(() => {
        if (self.isSupposedToFailInBefore) {
          // there is a bug in nightwatch that if test fails in `before`, test
          // would still be reported as passed with a exit code = 0. We'll have 
          // to let magellan know the test fails in this way 
          /* istanbul ignore next */
          process.exit(100);
        }
        callback();
      });
  }
}

module.exports = BaseTest;