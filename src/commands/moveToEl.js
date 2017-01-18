"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

let MoveToEl = function (nightwatch = null, customized_settings = null) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "movetoel";
};

util.inherits(MoveToEl, ClickEl);

MoveToEl.prototype.do = function (magellanSel) {
  let self = this;
  let now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  this.client.api
    .moveToElement(
    "css selector",
    "[" + this.selectorPrefix + "='" + magellanSel + "']",
    this.xoffset,
    this.yoffset,
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass();
    });
};

MoveToEl.prototype.command = function (selector, xoffset, yoffset, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.xoffset = xoffset;
  this.yoffset = yoffset;

  this.successMessage = "Moved to selector <" + this.selector + "> after %d milliseconds";
  this.failureMessage = "Could not move to selector <" + this.selector + "> after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = MoveToEl;