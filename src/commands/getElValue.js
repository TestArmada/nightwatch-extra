import util from "util";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";
import stats from "../util/stats";

const GetElValue = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "getelvalue";
};

util.inherits(GetElValue, BaseCommand);

GetElValue.prototype.do = function (value) {
  this.pass({ actual: value });
};

/*eslint no-unused-vars:0 */
GetElValue.prototype.injectedJsCommand = function ($el, sizzle) {
  return "return sizzle.getText($el)";
};

GetElValue.prototype.pass = function (actual) {
  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, actual, actual,
    util.format(this.successMessage, this.time.totalTime), true);

  stats({
    capabilities: this.client.options.desiredCapabilities,
    type: "command",
    cmd: this.cmd,
    value: this.time
  });

  if (this.cb) {
    this.cb.apply(this.client.api, [actual, this.selector]);
  }
  this.emit("complete");
};

GetElValue.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = `Selector '${this.selector}' was visible after %d milliseconds.`;
  this.failureMessage = `Selector '${this.selector}' was not visible after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = GetElValue;
