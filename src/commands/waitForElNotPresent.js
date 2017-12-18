import util from "util";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";
import settings from "../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const WautForElNotPresent = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "waitforelementnotpresent";
};

util.inherits(WautForElNotPresent, BaseCommand);

WautForElNotPresent.prototype.do = function (value) {
  this.pass({ actual: value });
};

WautForElNotPresent.prototype.checkConditions = function () {
  const self = this;

  this.execute(
    this.executeSizzlejs,
    [this.selector, this.injectedJsCommand()],
    (result) => {
      const elapsed = (new Date()).getTime() - self.startTime;

      if (result.isVisibleStrict === false || elapsed > MAX_TIMEOUT) {

        if (result.isVisibleStrict === false) {
          const elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;
          self.do("not present");
        } else {
          self.fail({
            actual: "not present",
            expected: "still present"
          });
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

/*eslint no-unused-vars:0 */
WautForElNotPresent.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

WautForElNotPresent.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = `Selector '${this.selector}' successfully disappeared`
    + " after %d milliseconds.";
  this.failureMessage = `Selector '${this.selector}' failed to disappear after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = WautForElNotPresent;
