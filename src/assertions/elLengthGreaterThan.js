"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";

let ElLengthGreaterThan = function (nightwatch = null, customized_settings = null) {
  BaseAssertion.call(this, nightwatch, customized_settings);
  this.cmd = "ellengthgreaterthan";
}

util.inherits(ElLengthGreaterThan, BaseAssertion);

ElLengthGreaterThan.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual <= expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

ElLengthGreaterThan.prototype.injectedJsCommand = function ($el, sizzle) {
  let ret = "";
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
}

ElLengthGreaterThan.prototype.command = function (selector, selectUsing, expected) {
  this.selector = selectorUtil.normalize(selector);
  this.selectUsing = selectUsing;
  this.expected = expected;

  this.message = util.format("Testing if selector <%s> length is greater than <%s> after %d milliseconds",
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

module.exports = ElLengthGreaterThan;