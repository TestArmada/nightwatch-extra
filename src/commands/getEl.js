"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

let GetEl = function () {
  BaseCommand.call(this);
  this.cmd = "getel";
}

util.inherits(GetEl, BaseCommand);

GetEl.prototype.do = function(value){
  this.pass(value);
};

GetEl.prototype.injectedJsCommand = function ($el) {
  return "return $el.length > 0";
}

GetEl.prototype.command = function (selector, cb) {
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

module.exports = GetEl;