var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var ClickEl = require("./clickEl");

function SetElValue(nightwatch, customized_settings) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "setelvalue";
}

util.inherits(SetElValue, ClickEl);

SetElValue.prototype.do = function (magellanSel) {
  var self = this;
  var now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;
  this.client.api
    .setValue(
      "css selector",
      "[data-magellan-temp-automation-id='" + magellanSel + "']",
      this.valueToSet,
      function () {
        self.time.seleniumCallTime = (new Date()).getTime() - now;
        self.pass();
      });
};

SetElValue.prototype.command = function (selector, valueToSet, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.valueToSet = valueToSet;
  this.cb = cb;

  this.successMessage = "Selector <" + this.selector + "> set value to [" + this.valueToSet + "] after %d milliseconds";
  this.failureMessage = "Selector <" + this.selector + "> could not set value to [" + this.valueToSet + "] after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SetElValue;
