var util = require("util"),
  selectorUtil = require("../util/selector");

var BaseElAssertion = require("./base/baseElAssertion");

var settings = require("../settings");
var MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
var WAIT_INTERVAL = settings.WAIT_INTERVAL;
var SEEN_MAX = settings.SEEN_MAX;
var JS_SEEN_MAX = settings.JS_SEEN_MAX;

function ElLengthGreaterThan(nightwatch, customized_settings) {
  BaseElAssertion.call(this, nightwatch, customized_settings);
  this.cmd = "ellengthgreaterthan";
  this.checkConditions = this.checkConditions.bind(this);
};

util.inherits(ElLengthGreaterThan, BaseElAssertion);

ElLengthGreaterThan.prototype.checkConditions = function () {
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
          self.assert(result.value.value, self.lengthToCompare);
        } else {
          self.fail(null, null, self.notVisibleFailureMessage);
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

ElLengthGreaterThan.prototype.command = function (selector, selectUsing, lengthToCompare) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.selectUsing = selectUsing;
  this.lengthToCompare = lengthToCompare;

  this.message = util.format("Testing if selector <%s> length is greater than <%s> after %d milliseconds",
    this.selector, this.lengthToCompare);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.lengthToCompare + " ]";
  this.notVisibleFailureMessage = "Selector '" + this.selector + "' was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();
  this.seenCount = 0;

  this.decide();
  this.checkConditions();

  return this;
};

ElLengthGreaterThan.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual <= expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

ElLengthGreaterThan.prototype.injectedJsCommand = function ($el, sizzle) {
  var ret = "";
  switch (this.selectUsing) {
    case "value":
      ret = "return $el[0].value.length;";
      break;
    case "text":
      ret = "return sizzle.getText($el).length;";
      break;
    case "html":
      ret = "return $el[0].innerHTML.length;";
      break;
    case "length":
      ret = "return $el.length;";
      break;
  }
  return ret;
};

module.exports = ElLengthGreaterThan;
