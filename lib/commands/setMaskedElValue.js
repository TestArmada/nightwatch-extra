var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var ClickEl = require("./clickEl");

var KEYBOARD_DELAY = 150;
var DEFAULT_FIELDSIZE = 50;

function SetMaskedElValue(nightwatch, customized_settings) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "setmaskedelvalue";
}

util.inherits(SetMaskedElValue, ClickEl);

SetMaskedElValue.prototype.do = function (magellanSel) {
  var self = this;
  var client = self.client.api;
  // Send 50 <- keys first (NOTE: this assumes LTR text flow!)
  var backarrows = [];
  for (var i = 0; i < this.fieldSize; i++) {
    backarrows.push("\uE012");
  }

  var keys = backarrows.concat(self.valueToSet.split(""));

  var nextKey = function () {
    if (keys.length === 0) {
      client
        .pause(KEYBOARD_DELAY, function () {
          self.pass();
        });
    } else {
      var key = keys.shift();
      client
        .pause(KEYBOARD_DELAY)
        .keys(key, function () {
          nextKey();
        });
    }
  };

  client
    .click(
      "css selector",
      "[data-magellan-temp-automation-id='" + magellanSel + "']",
      function () {
        nextKey();
      });
};

SetMaskedElValue.prototype.command = function (selector, valueToSet, /* optional */ fieldSize, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.valueToSet = valueToSet;

  if (typeof fieldSize === 'number') {
    this.fieldSize = fieldSize;
    this.cb = cb;
  } else {
    this.fieldSize = DEFAULT_FIELDSIZE;
    this.cb = fieldSize;
  }

  this.successMessage = "Selector <" + this.selector + "> (masked) set value to [" + this.valueToSet + "] after %d milliseconds";
  this.failureMessage = "Selector <" + this.selector + "> (masked) could not set value to [" + this.valueToSet + "] after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SetMaskedElValue;
