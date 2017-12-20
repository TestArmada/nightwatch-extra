import util from "util";

import selectorUtil from "../util/selector";
import BaseAssertion from "../base-assertion";
import settings from "../settings";

const ElLengthGreaterThan = function (nightwatch = null, customizedSettings = null) {
  BaseAssertion.call(this, nightwatch, customizedSettings);
  this.cmd = "ellengthgreaterthan";
};

util.inherits(ElLengthGreaterThan, BaseAssertion);

ElLengthGreaterThan.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual <= expected) {
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

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ElLengthGreaterThan;
