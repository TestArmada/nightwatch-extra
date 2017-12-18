import util from "util";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

const SetElValue = function (nightwatch = null, customizedSettings = null) {
  ClickEl.call(this, nightwatch, customizedSettings);
  this.cmd = "setelvalue";
};

util.inherits(SetElValue, ClickEl);

SetElValue.prototype.do = function (magellanSel) {
  const self = this;
  const now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;
  this.client.api
    .setValue(
    "css selector",
    `[${this.selectorPrefix}='${magellanSel}']`,
    this.valueToSet,
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass({});
    });
};

SetElValue.prototype.command = function (selector, valueToSet, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.valueToSet = valueToSet;
  this.cb = cb;

  this.successMessage = `Selector <${this.selector}> set value to`
    + ` [${this.valueToSet}] after %d milliseconds`;
  this.failureMessage = `Selector <${this.selector}> could not set`
    + ` value to [${this.valueToSet}] after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SetElValue;
