import util from "util";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";
import settings from "../settings";

const ElNotContainsText = function (nightwatch = null, customizedSettings = null) {
  BaseAssertion.call(this, nightwatch, customizedSettings);
  this.cmd = "elnotcontainstext";
};

util.inherits(ElNotContainsText, BaseAssertion);

ElNotContainsText.prototype.assert = function (actual, expected) {
  if (expected !== undefined
    && actual.indexOf(expected) < 0
    && !new RegExp(expected).exec(actual)) {
    this.pass({
      pactual: actual,
      expected,
      message: this.message
    });
  } else {
    this.fail({
      code: settings.FAILURE_REASONS.BUILTIN_ACTUAL_NOT_MEET_EXPECTED,
      pactual: actual,
      expected,
      message: this.message
    });
  }
};

/* eslint-disable */
ElNotContainsText.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

ElNotContainsText.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> does not contains text <%s> after %d milliseconds ",
    this.selector, this.expected);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ElNotContainsText;
