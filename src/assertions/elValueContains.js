"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";

let ElValueContains = function () {
  BaseAssertion.call(this);
  this.cmd = "elvaluecontains";
}

util.inherits(ElValueContains, BaseAssertion);

ElValueContains.prototype.assert = function (actual, expected) {
  if (expected === undefined
    || (actual.indexOf(expected) < 0
      && !(new RegExp(expected).exec(actual)))) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

ElValueContains.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return $el[0].value";
}

ElValueContains.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> has value <%s> after %d milliseconds ",
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

module.exports = ElValueContains;