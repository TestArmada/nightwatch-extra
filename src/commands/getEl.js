import util from "util";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

const GetEl = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "getel";
};

util.inherits(GetEl, BaseCommand);

GetEl.prototype.do = function (value) {
  this.pass({ actual: value });
};

/*eslint no-unused-vars:0 */
GetEl.prototype.injectedJsCommand = function ($el) {
  return "return $el.length > 0";
};

GetEl.prototype.command = function (selector, cb) {
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

module.exports = GetEl;
