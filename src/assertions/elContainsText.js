"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";

let ElContainsText = function () {
  BaseAssertion.call(this);
  this.cmd = "elcontainstext";
}

util.inherits(ElContainsText, BaseAssertion);

ElContainsText.prototype.assert = function (actual, expected) {
  let pactual = actual.replace(/[\s|\n]+/g, ' ');

  if (expected === undefined
    || (pactual.indexOf(expected) < 0
      && !(new RegExp(expected).exec(pactual)))) {
    this.fail(pactual, expected, this.message, this.failureDetails);
  } else {
    this.pass(pactual, expected, this.message);
  }
};

ElContainsText.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
}

ElContainsText.prototype.command = function (selector, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> contains text <%s> after %d milliseconds ",
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

module.exports = ElContainsText;