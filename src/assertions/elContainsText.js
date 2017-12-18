import util from "util";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";
import settings from "../settings";

const ElContainsText = function (nightwatch = null, customizedSettings = null) {
  BaseAssertion.call(this, nightwatch, customizedSettings);
  this.cmd = "elcontainstext";
};

util.inherits(ElContainsText, BaseAssertion);

ElContainsText.prototype.assert = function (actual, expected) {
  const pactual = actual.replace(/[\s|\n]+/g, " ");

  if (expected === undefined || pactual.indexOf(expected) < 0
    && !new RegExp(expected).exec(pactual)) {
    this.fail({
      code: settings.FAILURE_REASONS.BUILTIN_ACTUAL_NOT_MEET_EXPECTED,
      pactual,
      expected,
      message: this.message
    });
  } else {
    this.pass({
      pactual,
      expected,
      message: this.message
    });
  }
};

/* eslint-disable */
ElContainsText.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

ElContainsText.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> contains text <%s> after %d milliseconds",
    this.selector, this.expected);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ElContainsText;
