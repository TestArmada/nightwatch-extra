"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

let ClearElValue = function () {
  ClickEl.call(this);
  this.cmd = "clearelvalue";
}

util.inherits(ClearElValue, ClickEl);

ClearElValue.prototype.do = function (magellanSel) {
  var self = this;
  var now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  this.client.api
    .clearValue(
    "css selector",
    "[" + this.selectorPrefix + "='" + magellanSel + "']",
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass();
    });
};

ClearElValue.prototype.injectedJsCommand = function ($el, sizzle) {
  return "$el[0].value = '';return $el[0].getAttribute('data-magellan-temp-automation-id');";
}

ClearElValue.prototype.command = function (selector, cb) {
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

module.exports = ClearElValue;