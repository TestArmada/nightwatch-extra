var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var BaseElCommand = require("./base/baseElCommand");

// Wait until we've seen a selector as :visible SEEN_MAX times, with a
// wait for WAIT_INTERVAL milliseconds between each visibility test.
var settings = require("../settings");
var MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
var WAIT_INTERVAL = settings.WAIT_INTERVAL;
var SEEN_MAX = settings.SEEN_MAX;
var JS_SEEN_MAX = settings.JS_SEEN_MAX;

function GetElValue(nightwatch, customized_settings) {
  BaseElCommand.call(this, nightwatch, customized_settings);
  this.checkConditions = this.checkConditions.bind(this);
  this.pass = this.pass.bind(this);
  this.cmd = "getelvalue";
}

util.inherits(GetElValue, BaseElCommand);

GetElValue.prototype.checkConditions = function () {
  var self = this;

  this.execute(
    this.executeSizzlejs, [this.selector, this.injectedJsCommand()],
    function (result) {
      // Keep a running count of how many times we've seen this element visible
      if (result.isVisible) {
        self.seenCount++;
      }

      var elapsed = (new Date()).getTime() - self.startTime;

      // If we've seen the selector enough times or waited too long, then 
      // it's time to pass or fail and continue the command chain.
      if (result.seens >= JS_SEEN_MAX || self.seenCount >= SEEN_MAX || elapsed > MAX_TIMEOUT) {

        // Unlike clickEl, only issue a warning in the getEl() version of this
        if (result.selectorLength > 1) {
          console.log("WARNING: getEl saw selector " + self.selector + " but result length was " + result.selectorLength + ", with " + result.selectorVisibleLength + " of those :visible");
          console.log("Selector did not disambiguate after " + elapsed + " milliseconds, refine your selector or check DOM for problems.");
        }

        if (result.seens >= JS_SEEN_MAX || self.seenCount >= SEEN_MAX) {
          var elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;

          self.pass(result.value.value, self.selector);
        } else {
          self.fail();
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

GetElValue.prototype.pass = function (actual, sel) {
  var pactual = pexpected = actual || "visible";
  var elapsed = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, pactual, pexpected, util.format(this.successMessage, elapsed), true);
  if (this.cb) {
    this.cb.apply(this.client.api, [actual, sel]);
  }
  this.emit("complete");
};

GetElValue.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

GetElValue.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector '" + this.selector + "' was visible after %d milliseconds.";
  this.failureMessage = "Selector '" + this.selector + "' was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = GetElValue;
