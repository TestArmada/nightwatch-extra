import util from "util";

import BaseAssertion from "../../base-mobile-assertion";
import settings from "../../settings";
import _ from "lodash";

const MobileElContainsText = function (nightwatch = null) {
    BaseAssertion.call(this, nightwatch);
  this.cmd = "mobileElContainsText";
};

util.inherits(MobileElContainsText, BaseAssertion);

MobileElContainsText.prototype.do = function (value) {
  const self = this;

  const check = function (selector){
    self.client.api.elementIdText(selector, function (result) {
      if (result.value === null) {
        self.fail({
          code: settings.default.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_FOUND,
          actual: result.value,
          expected: self.expected,
          message: self.message
        });
      } else if (result.status === 0) {
        self.assert({
          actual: result.value,
          expected: self.expected
        });
      } else {
        self.fail({
          code: settings.default.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_FOUND,
          actual: result.value,
          expected: self.expected,
          message: self.protocolFailureDetails
        });
      }
    });
  };

  if (_.toLower(this.client.api.capabilities.platformName) === "android") {
    check(value.ELEMENT);
  } else if (_.toLower(self.client.api.capabilities.platformName) === "ios") {
    self.client.api.elementIdElement(value.ELEMENT, "xpath", "//XCUIElementTypeTextField", function (result) {
      check(result.value.ELEMENT);
    });
  } else {
    self.failWithMessage("Invalid platform " + self.client.api.capabilities.platformName + ", expected ios or android");
  }
};

MobileElContainsText.prototype.assert = function ({ actual, expected }) {
  const pactual = actual.replace(/[\s|\n]+/g, " ");
  if (expected === undefined || pactual.indexOf(expected) < 0
    && !new RegExp(expected).exec(pactual)) {
    this.fail({
      code: settings.FAILURE_REASONS.BUILTIN_ACTUAL_NOT_MEET_EXPECTED,
      actual: pactual,
      expected,
      message: this.message
    });
  } else {
    this.pass({
      actual: pactual,
      expected,
      message: this.message
    });
  }
};

/*eslint max-params:["error", 4] */
MobileElContainsText.prototype.command = function (using, selector, expected) {
  this.selector = selector;
  this.using = using;
  this.expected = expected;

  this.message = util.format("Testing if selector <%s:%s> "
    + "contains text <%s> after %d milliseconds ",
    this.using, this.selector, this.expected);

  this.protocolFailureDetails = util.format("Selector <%s:%s> not found",
    this.using, this.selector);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = MobileElContainsText;
