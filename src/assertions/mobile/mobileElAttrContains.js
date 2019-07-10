import util from "util";

import BaseAssertion from "../../base-mobile-assertion";

const MobileElAttrContains = function (nightwatch = null) {
  BaseAssertion.call(this, nightwatch);
  this.cmd = "mobileelattrcontains";
};

util.inherits(MobileElAttrContains, BaseAssertion);

MobileElAttrContains.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdAttribute(value.ELEMENT, this.attr, (result) => {
      if(result.value === null){
        self.fail("[attribute not found]", self.expected, self.message + "[ATTRIBUTE_NOT_FOUND]");
      } else if (result.status === 0) {
        self.assert(result.value, self.expected);
      } else {
        self.fail("selenium return.status=0",
          `selenium result.status=${result.status}`,
          self.protocolFailureDetails);
      }
    });
};

MobileElAttrContains.prototype.assert = function (actual, expected) {
  const pactual = actual.replace(/[\s|\n]+/g, " ");

  if (expected === undefined || pactual.indexOf(expected) < 0
    && !new RegExp(expected).exec(pactual)) {
    this.fail(pactual, expected, this.message, this.failureDetails);
  } else {
    this.pass(pactual, expected, this.message);
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
  this.failureDetails = `actual result:[ %s ], expected:[ ${this.expected} ]`;
  this.protocolFailureDetails = util.format("Selector <%s:%s> doesn't have such attribute %s",
    this.using, this.selector, this.attr);
  this.notVisibleFailureMessage = `Selector <${this.using}:${this.selector
    }> was not visible after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = MobileElAttrContains;
