"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";

let SelectorHasLength = function (nightwatch = null, customized_settings = null) {
  BaseAssertion.call(this, nightwatch, customized_settings);
  this.cmd = "selectorhaslength";
}

util.inherits(SelectorHasLength, BaseAssertion);

SelectorHasLength.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual !== expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

SelectorHasLength.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return $el.length";
}

SelectorHasLength.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> has length <%s> after %d milliseconds",
    this.selector, this.expected);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.expected + " ]";
  this.notVisibleFailureMessage = "Selector '" + this.selector + "' was not visible after %d milliseconds.";


  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SelectorHasLength;