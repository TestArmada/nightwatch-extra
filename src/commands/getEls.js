"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

let GetEls = function () {
  BaseCommand.call(this);
  this.cmd = "getels";
};

util.inherits(GetEls, BaseCommand);

GetEls.prototype.do = function (value) {
  var ret = [];
  for (var i = 1; i <= value.value; i++) {
    ret.push({
      'ELEMENT': i
    });
  }
  this.pass(ret);
};

GetEls.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

GetEls.prototype.command = function (selector, cb) {
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

module.exports = GetEls;
