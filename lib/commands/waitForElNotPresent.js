// Safe version of waitForElementNotPresent

var util = require("util");

var selectorUtil = require("../util/selector");
var BaseElCommand = require("./base/baseElCommand");

// Wait until we've seen a selector as :visible SEEN_MAX times, with a
// wait for WAIT_INTERVAL milliseconds between each visibility test.
var settings = require("../settings");
var MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
var WAIT_INTERVAL = settings.WAIT_INTERVAL;

function WaitForElementNotPresent(nightwatch, customized_settings) {
  BaseElCommand.call(this, nightwatch, customized_settings);
  this.checkConditions = this.checkConditions.bind(this);
  this.cmd = "waitforelementnotpresent";
}

util.inherits(WaitForElementNotPresent, BaseElCommand);

WaitForElementNotPresent.prototype.checkConditions = function () {
  var self = this;

  this.execute(
    this.executeSizzlejs, [this.selector, this.injectedJsCommand()],
    function (result) {
      var elapsed = (new Date()).getTime() - self.startTime;

      if (result.isVisibleStrict === false || elapsed > MAX_TIMEOUT) {

        if (result.isVisibleStrict === false) {
          var elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;
          self.pass("not present");
        } else {
          self.fail("not present", "still present");
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

WaitForElementNotPresent.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

WaitForElementNotPresent.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector '" + this.selector + "' successfully disappeared after %d milliseconds.";
  this.failureMessage = "Selector '" + this.selector + "' failed to disappear after %d milliseconds.";

  this.startTime = (new Date()).getTime();
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = WaitForElementNotPresent;
