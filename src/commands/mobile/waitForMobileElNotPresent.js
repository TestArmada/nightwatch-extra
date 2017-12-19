import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = settings.SEEN_MAX;

const WaitForMobileElNotPresent = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "waitformobileelnotpresent";
};

util.inherits(WaitForMobileElNotPresent, BaseCommand);

WaitForMobileElNotPresent.prototype.do = function () { };

WaitForMobileElNotPresent.prototype.checkConditions = function () {
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
    /*eslint-disable no-magic-numbers*/
    if (result.status === -1
      && result.errorStatus === 7) {
      // element isn't found
      self.seenCount += 1;
    }

    const elapsed = (new Date()).getTime() - self.startTime;

    if (self.seenCount >= SEEN_MAX || elapsed > MAX_TIMEOUT) {
      if (self.seenCount >= SEEN_MAX) {
        const elapse = (new Date()).getTime();
        self.time.executeAsyncTime = elapse - self.startTime;
        self.time.seleniumCallTime = 0;

        self.pass({
          actual: "not visible",
          expected: "not visible"
        });
      } else {
        self.fail({
          code: settings.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_VISIBLE,
          actual: "visible",
          expected: "not visible",
          message: self.failureMessage
        });
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

/*eslint max-params:["error", 4] */
WaitForMobileElNotPresent.prototype.command = function (using, selector) {
  this.selector = selector;
  this.using = using;

  this.successMessage = util.format("Selector <%s:%s> successfully disappeared "
    + "after %d milliseconds ", this.using, this.selector);
  this.failureMessage = util.format("Selector <%s:%s> failed to disappear "
    + "after %d milliseconds ", this.using, this.selector);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = WaitForMobileElNotPresent;
