import util from "util";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";
import settings from "../settings";

const SelectorHasLength = function (nightwatch = null, customizedSettings = null) {
  BaseAssertion.call(this, nightwatch, customizedSettings);
  this.cmd = "selectorhaslength";
};

util.inherits(SelectorHasLength, BaseAssertion);

SelectorHasLength.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual !== expected) {
    this.fail({
      code: settings.FAILURE_REASONS.BUILTIN_ACTUAL_NOT_MEET_EXPECTED,
      pactual: actual,
      expected,
      message: this.message
    });
  } else {
    this.pass({
      pactual: actual,
      expected,
      message: this.message
    });
  }
};

/* eslint-disable */
SelectorHasLength.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return $el.length";
}

SelectorHasLength.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> has length <%s> after %d milliseconds",
    this.selector, this.expected);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SelectorHasLength;