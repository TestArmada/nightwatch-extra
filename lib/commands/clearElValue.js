var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var ClickEl = require("./clickEl");

function clearElValue(nightwatch, customized_settings) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "setelvalue";
}

util.inherits(clearElValue, ClickEl);

clearElValue.prototype.do = function (magellanSel) {
  var self = this;
  var now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;
  this.client.api
    .clearValue(
      "css selector",
      "[data-magellan-temp-automation-id='" + magellanSel + "']",
      function () {
        self.time.seleniumCallTime = (new Date()).getTime() - now;
        self.pass();
      });
};

clearElValue.prototype.injectedJsCommand = function ($el, sizzle) {
  return "$el[0].value = '';return $el[0].getAttribute('data-magellan-temp-automation-id');";
};

clearElValue.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector <" + this.selector + "> value is cleared after %d milliseconds";
  this.failureMessage = "Selector <" + this.selector + "> could not clear value after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = clearElValue;
