import util from "util";
import ClickEl from "./clickEl";

const ClickAutomationEl = function (nightwatch = null, customizedSettings = null) {
  ClickEl.call(this, nightwatch, customizedSettings);
  this.cmd = "clickautomationel";
};

util.inherits(ClickAutomationEl, ClickEl);

ClickAutomationEl.prototype.command = function (selector, cb) {
  const newSelector = `[data-automation-id='${selector}']`;
  return ClickEl.prototype.command.call(this, newSelector, cb);
};

module.exports = ClickAutomationEl;
