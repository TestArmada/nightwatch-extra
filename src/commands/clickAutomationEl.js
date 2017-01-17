"use strict";

import util from "util";
import ClickEl from "./clickEl";

let ClickAutomationEl = function (nightwatch = null, customized_settings = null) {
  ClickEl.call(this, nightwatch, customized_settings);
  this.cmd = "clickautomationel";
};

util.inherits(ClickAutomationEl, ClickEl);

ClickAutomationEl.prototype.command = function (selector, cb) {
  var newSelector = "[data-automation-id='" + selector + "']";
  return ClickEl.prototype.command.call(this, newSelector, cb);
};

module.exports = ClickAutomationEl;