import _ from "lodash";
import settings from "./settings";
import Worker from "./worker/magellan";
import logger from "./util/logger";

const fs = require("fs");
const path = require("path");
function getMostRecentFileName(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      return callback(err);
    }
    const ret = _.max(files, f => {
      var fullpath = path.join(dir, f);
      return fs.statSync(fullpath).ctime;
    });
    return callback(null, ret ? `${dir}/${ret}` : null);
  });
}

const BaseTest = function(steps, customizedSettings = null) {
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
    Object.defineProperty(self, k, { enumerable: true, value: v });
  });

  // copy before, beforeEach, afterEach, after to prototype
  _.forEach(enumerables, k => {
    const srcFn = self[k] || BaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k, { enumerable: true, value: srcFn });
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
    client.perform(() => {
      callback();
    });
  },

  beforeEach(client) {
    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    var sessionId =
      client.sessionId || client.capabilities["webdriver.remote.sessionid"];
    if (sessionId) {
      settings.sessionId = sessionId;
      if (this.isWorker) {
        this.worker.emitMetadata({
          sessionId: settings.sessionId,
          capabilities: client.capabilities
        });
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
    var sessionId =
      client.sessionId || client.capabilities["webdriver.remote.sessionid"];
    if (sessionId) {
      settings.sessionId = sessionId;
      if (this.isWorker) {
        if (
          client.screenshotsPath &&
          (client.currentTest.results.failed ||
            client.currentTest.results.errors)
        ) {
          const prefix = client.currentTest.module
            .replace(/\s/g, "-")
            .replace(/"|'/g, "");
          const screenShotDir = `${client.screenshotsPath}/${prefix}`
          getMostRecentFileName(
            screenShotDir,
            (err, screenShotPath) => {
              if (err) {
                logger.warn(`Failed to get screenshot. Error: ${err}`);
              }
              this.worker.emitMetadata({
                sessionId: settings.sessionId,
                capabilities: client.capabilities,
                screenShotPath
              });
            }
          );
        }else{
          this.worker.emitMetadata({
            sessionId: settings.sessionId,
            capabilities: client.capabilities
          });
        }
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
