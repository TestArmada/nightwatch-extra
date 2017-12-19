import util from "util";

import BaseAssertion from "../../base-mobile-assertion";
import settings from "../../settings";

const MobileElAttrContains = function (nightwatch = null) {
  BaseAssertion.call(this, nightwatch);
  this.cmd = "mobileelattrcontains";
};

util.inherits(MobileElAttrContains, BaseAssertion);

MobileElAttrContains.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdAttribute(value.ELEMENT, this.attr, (result) => {
      if (result.value === null) {
        // attribute not found for this element
        self.fail({
          code: settings.FAILURE_REASONS.BUILTIN_ATTRIBUTE_NOT_FOUND,
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
          code: settings.FAILURE_REASONS.BUILTIN_ATTRIBUTE_NOT_FOUND,
          actual: result.value,
          expected: self.expected,
          message: self.protocolFailureDetails
        });
      }
    });
};

MobileElAttrContains.prototype.assert = function ({ actual, expected }) {
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

/*eslint max-params:["error", 4] */
MobileElAttrContains.prototype.command = function (using, selector, attr, expected) {
  this.selector = selector;
  this.using = using;
  this.attr = attr;
  this.expected = expected;

  this.message = util.format("Testing if selector <%s:%s> attribute <%s> "
    + "contains text <%s> after %d milliseconds ",
    this.using, this.selector, this.attr, this.expected);

  this.protocolFailureDetails = util.format("Selector <%s:%s> doesn't have such attribute %s",
    this.using, this.selector, this.attr);

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = MobileElAttrContains;
