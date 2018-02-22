import util from "util";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";
import settings from "../settings";

const ElValueContains = function (nightwatch = null, customizedSettings = null) {
  BaseAssertion.call(this, nightwatch, customizedSettings);
  this.cmd = "elvaluecontains";
};

util.inherits(ElValueContains, BaseAssertion);

ElValueContains.prototype.assert = function (actual, expected) {
  /*
  !(!actual && (!actual === !expected)) related when actual is null/undefined/"" and expected
  is also one of these values, they should be equal and passed

  (!actual && (!actual !== !expected)) related to when actual is null/undefined/"" and expected is not
  they are not same, in case next condition actual.indexOf(expected) will throw kind like
  Cannot read property 'indexOf' of null exception

  Sometimes this could be happen in Microsoft Edge when no input and actual will be null
  */
 if (expected === undefined
  || !(!actual && (!actual === !expected)) || (!actual && (!actual !== !expected)) 
  || actual.indexOf(expected) < 0
  && !new RegExp(expected).exec(actual)) {

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
ElValueContains.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return $el[0].value";
}

ElValueContains.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> has value <%s> after %d milliseconds ",
    this.selector, this.expected);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ElValueContains;
