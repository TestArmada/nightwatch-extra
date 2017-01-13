"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

let ClickEl = function () {
  BaseCommand.call(this);
  this.cmd = "clickel";
}

util.inherits(ClickEl, BaseCommand);

ClickEl.prototype.do = function (magellanSel) {
  let self = this;
  let now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  this.client.api.click(
    "css selector",
    "[" + this.selectorPrefix + "='" + magellanSel + "']",
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass();
    });
};

ClickEl.prototype.injectedJsCommand = function ($el) {
  return "return $el[0].getAttribute('data-magellan-temp-automation-id')";
}

ClickEl.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector <" + this.selector + "> clicked after %d milliseconds";
  this.failureMessage = "Selector <" + this.selector + "> could not be clicked after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ClickEl;