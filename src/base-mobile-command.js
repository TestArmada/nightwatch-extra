import EventEmitter from "events";
import util from "util";

import settings from "./settings";

// Wait until we've seen a selector as :visible SEEN_MAX times, with a
// wait for WAIT_INTERVAL milliseconds between each visibility test.
const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = settings.MOBILE_SEEN_MAX;

const Base = function (nightwatch = null) {
  EventEmitter.call(this);

  this.startTime = 0;
  this.time = {
    totalTime: 0,
    seleniumCallTime: 0,
    executeAsyncTime: 0
  };

  this.selector = null;

  this.successMessage = "";
  this.failureMessage = "";

  this.checkConditions = this.checkConditions.bind(this);
  // for mock and unit test
  if (nightwatch) {
    this.client = nightwatch;
  }
};

util.inherits(Base, EventEmitter);

Base.prototype.protocol = function (options, cb) {
  this.client.runProtocolAction(options, cb).send();
};

Base.prototype.checkConditions = function () {
  const self = this;

  const options = {
    path: `/session/${this.client.sessionId}/element`,
    method: "POST",
    data: {
      using: this.using,
      value: this.selector
    }
  };

  self.protocol(options, (result) => {
    if (result.status === 0) {
      // sucessful
      self.seenCount += 1;
    }

    const elapsed = (new Date()).getTime() - self.startTime;

    if (self.seenCount >= SEEN_MAX || elapsed > MAX_TIMEOUT) {
      if (self.seenCount >= SEEN_MAX) {
        const elapse = (new Date()).getTime();

        self.time.executeAsyncTime = elapse - self.startTime;
        self.time.seleniumCallTime = 0;

        self.do(result.value);
      } else {
        self.fail({ code: settings.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_FOUND });
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

Base.prototype.pass = function ({ actual, expected }) {
  const pactual = actual || "visible";
  const pexpected = pactual;
  const message = this.successMessage;

  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, pactual, pexpected, util.format(message, this.time.totalTime), true);

  if (this.cb) {
    this.cb.apply(this.client.api, [actual]);
  }
  this.emit("complete");
};

Base.prototype.fail = function ({ code, actual, expected }) {
  // if no code here we do nothing
  const pcode = code ? code : "";

  const pactual = actual || "not visible";
  const pexpected = expected || "visible";
  const message = `${this.failureMessage} [[${pcode}]]`;

  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(false, pactual, pexpected, util.format(message, this.time.totalTime), true);

  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

/**
 * All children have to implement do
 *
 */
/* istanbul ignore next */
/*eslint no-unused-vars:0 */
Base.prototype.do = function (value) {
};

/**
 * All children have to implement command
 *
 */
/* istanbul ignore next */
/*eslint no-unused-vars:0 */
Base.prototype.command = function (selector, cb) {
  return this;
};

module.exports = Base;
