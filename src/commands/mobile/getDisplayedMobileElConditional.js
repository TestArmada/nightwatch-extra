import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = 3;

/**
 * Custom command which returns true if the element is displayed (https://w3c.github.io/webdriver/#element-displayedness).
 * @param {Object} nightwatch
 * @constructor
 */
const GetDisplayedMobileElConditional = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getdisplayedmobileelconditional";
};

util.inherits(GetDisplayedMobileElConditional, BaseCommand);

GetDisplayedMobileElConditional.prototype.do = function (value) {
  this.pass({actual: value});
};

GetDisplayedMobileElConditional.prototype.checkConditions = function () {
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
        self.protocol({
          path: `/session/${this.client.sessionId}/element/${result.value.ELEMENT}/displayed`,
          method: "GET",
        }, (result) => {
          self.do(result.value);
        });
      } else {
        self.do(false);
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

/*eslint max-params:["error", 5] */
GetDisplayedMobileElConditional.prototype.command = function (using, selector, maxTimeout, cb) {
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

GetDisplayedMobileElConditional.prototype.pass = function ({actual}) {
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

module.exports = GetDisplayedMobileElConditional;
