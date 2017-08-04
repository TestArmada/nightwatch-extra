import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = 10000;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const GetMobileElConditional = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getmobileelconditional";
};

util.inherits(GetMobileElConditional, BaseCommand);

GetMobileElConditional.prototype.do = function (value) {
  this.pass(value);
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
      self.seenCount += 1;
    }

    const elapsed = (new Date()).getTime() - self.startTime;
    console.log("elapsed " + elapsed);
    if (self.seenCount >= 1 || elapsed > MAX_TIMEOUT) {
      if (self.seenCount >= 1) {
        const elapse = (new Date()).getTime();
        self.time.executeAsyncTime = elapse - self.startTime;
        self.time.seleniumCallTime = 0;
        self.do(true);
      } else {
        console.log("test:" + result.value.stringify);
        self.do(false);
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

GetMobileElConditional.prototype.command = function (using, selector, cb) {
  this.selector = selector;
  this.using = using;
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

GetMobileElConditional.prototype.pass = function (actual, expected) {
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

module.exports = GetMobileElConditional;
