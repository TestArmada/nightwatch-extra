import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = 3;

const GetMobileElConditional = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getmobileelconditional";
};

util.inherits(GetMobileElConditional, BaseCommand);

GetMobileElConditional.prototype.do = function (value) {
  this.pass({ actual: value });
};

GetMobileElConditional.prototype.checkConditions = function () {
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
      self.seenCount += 3;
    }

    const elapsed = (new Date()).getTime() - self.startTime;
    if (self.seenCount >= SEEN_MAX || elapsed > self.maxTimeout) {
      if (self.seenCount >= SEEN_MAX) {
        const elapse = (new Date()).getTime();
        self.time.executeAsyncTime = elapse - self.startTime;
        self.time.seleniumCallTime = 0;
        self.do(true);
      } else {
        self.do(false);
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};
/*eslint max-params:["error", 5] */
GetMobileElConditional.prototype.command = function (using, selector, maxTimeout, cb) {
  this.selector = selector;
  this.using = using;
  this.maxTimeout = maxTimeout;
  this.cb = cb;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + "was visible after %d milliseconds.";
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + "was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

GetMobileElConditional.prototype.pass = function ({ actual }) {
  this.time.totalTime = (new Date()).getTime() - this.startTime;
  if (actual) {
    this.client.assertion(true, actual, actual,
      util.format(this.successMessage, this.time.totalTime), true);
  } else {
    this.client.assertion(true, actual, actual,
      util.format(this.failureMessage, this.time.totalTime), true);
  }

  if (this.cb) {
    this.cb.apply(this.client.api, [actual]);
  }
  this.emit("complete");
};

module.exports = GetMobileElConditional;
