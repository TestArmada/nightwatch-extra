// Assert whether a selector has a given expected query result length

var util = require("util"),
  selectorUtil = require("../util/selector");

var BaseElAssertion = require("./base/baseElAssertion");

var settings = require("../settings");
var MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
var WAIT_INTERVAL = settings.WAIT_INTERVAL;
var SEEN_MAX = settings.SEEN_MAX;
var JS_SEEN_MAX = settings.JS_SEEN_MAX;

function SelectorHasLength(nightwatch, customized_settings) {
  BaseElAssertion.call(this, nightwatch, customized_settings);
  this.cmd = "selectorhaslength";
  this.checkConditions = this.checkConditions.bind(this);
};

util.inherits(SelectorHasLength, BaseElAssertion);

SelectorHasLength.prototype.checkConditions = function () {
  var self = this;

  this.execute(
    this.executeSizzlejs, [this.selector, this.injectedJsCommand()],
    function (result) {
      // Keep a running count of how many times we've seen this element visible
      if (result.isVisible) {
        self.seenCount += 1;
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

        if (self.seenCount >= SEEN_MAX || result.seens >= JS_SEEN_MAX) {

          var elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;
          self.assert(result.value.value, self.expected);
        } else {
          self.fail(null, null, self.notVisibleFailureMessage);
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

SelectorHasLength.prototype.command = function (selector, expectedLength) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.expected = expectedLength;

  this.message = util.format("Testing if selector <%s> has length <%s> after %d milliseconds",
    this.selector, this.expected);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.expected + " ]";
  this.notVisibleFailureMessage = "Selector '" + this.selector + "' was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

SelectorHasLength.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual !== expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

SelectorHasLength.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

module.exports = SelectorHasLength;
