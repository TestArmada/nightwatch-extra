"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

let GetElValue = function () {
  BaseCommand.call(this);
  this.cmd = "getelvalue";
};

util.inherits(GetElValue, BaseCommand);

GetElValue.prototype.do = function (value) {
  this.pass(value);
};

GetElValue.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

GetElValue.prototype.pass = function (actual) {
  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, actual, actual, util.format(this.successMessage, this.time.totalTime), true);

  // statsd({
  //   capabilities: this.client.options.desiredCapabilities,
  //   type: "command",
  //   cmd: this.cmd,
  //   value: this.time
  // });

  if (this.cb) {
    this.cb.apply(this.client.api, [actual, this.selector]);
  }
  this.emit("complete");
};

GetElValue.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector '" + this.selector + "' was visible after %d milliseconds.";
  this.failureMessage = "Selector '" + this.selector + "' was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = GetElValue;
