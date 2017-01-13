"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

var KEYBOARD_DELAY = 150;
var DEFAULT_FIELDSIZE = 50;

let SetMaskedElValue = function () {
  ClickEl.call(this);
  this.cmd = "setmaskedelvalue";
}

util.inherits(SetMaskedElValue, ClickEl);

SetMaskedElValue.prototype.do = function (magellanSel) {
  let self = this;
  let client = self.client.api;

  // Send 50 <- keys first (NOTE: this assumes LTR text flow!)
  let backarrows = [];
  for (let i = 0; i < this.fieldSize; i++) {
    backarrows.push("\uE012");
  }

  let keys = backarrows.concat(self.valueToSet.split(""));

  let nextKey = function () {
    if (keys.length === 0) {
      client
        .pause(KEYBOARD_DELAY, () => {
          self.pass();
        });
    } else {
      let key = keys.shift();
      client
        .pause(KEYBOARD_DELAY)
        .keys(key, () => {
          nextKey();
        });
    }
  };

  client
    .click(
    "css selector",
    "[" + this.selectorPrefix + "='" + magellanSel + "']",
    () => {
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