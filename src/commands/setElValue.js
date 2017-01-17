"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

let SetElValue = function (nightwatch = null, customized_settings = null) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "setelvalue";
}

util.inherits(SetElValue, ClickEl);

SetElValue.prototype.do = function (magellanSel) {
  let self = this;
  let now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;
  this.client.api
    .setValue(
    "css selector",
    "[" + this.selectorPrefix + "='" + magellanSel + "']",
    this.valueToSet,
    () => {
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