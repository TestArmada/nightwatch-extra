// Assert whether a selector contains a given text

var util = require("util"),
  selectorUtil = require("../util/selector"),
  escapeRegExp = require("lodash/escapeRegExp");

var BaseElAssertion = require("./base/baseElAssertion");

function ElContainsText() {
  BaseElAssertion.call(this);
  this.cmd = "elnotcontainstext";
};

util.inherits(ElContainsText, BaseElAssertion);

ElContainsText.prototype.command = function (selector, expectedContainedText) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.expected = expectedContainedText;

  this.message = util.format("Testing if selector <%s> does not contains text <%s> after %d milliseconds ",
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

ElContainsText.prototype.assert = function (actual, expected) {
  if (expected !== undefined 
    && actual.indexOf(expected) < 0 
    && !(new RegExp(escapeRegExp(expected)).exec(actual))) {
    this.pass(actual, expected, this.message);
  } else {
    this.fail(actual, expected, this.message, this.failureDetails);
  }
};

ElContainsText.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

module.exports = ElContainsText;
