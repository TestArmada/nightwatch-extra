// Assert whether a selector contains a given text

var util = require("util"),
  selectorUtil = require("../util/selector"),
  escapeStringRegexp = require("escapeStringRegexp");

var BaseElAssertion = require("./base/baseElAssertion");

function ElValueContains() {
  BaseElAssertion.call(this);
  this.cmd = "elvaluecontains";
};

util.inherits(ElValueContains, BaseElAssertion);

ElValueContains.prototype.command = function (selector, expectedContainedText) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.expected = expectedContainedText;

  this.message = util.format("Testing if selector <%s> has value <%s> after %d milliseconds ",
    this.selector, this.expected);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.expected + " ]";

  this.startTime = (new Date()).getTime();

  this.execute(
    this.selector,
    this.injectedJsCommand(),
    function (result) {
      self.assert(result.value.value, self.expected);
    });
};

ElValueContains.prototype.assert = function (actual, expected) {
  if (expected === undefined 
    || actual.indexOf(expected) < 0
    || !(new RegExp(escapeStringRegexp(expected)).exec(actual))) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

ElValueContains.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return $el[0].value";
};

module.exports = ElValueContains;
