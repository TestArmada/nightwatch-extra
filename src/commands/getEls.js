import util from "util";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

const GetEls = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "getels";
};

util.inherits(GetEls, BaseCommand);

GetEls.prototype.do = function (value) {
  const ret = [];
  for (let i = 1; i <= value; i++) {
    ret.push({
      "ELEMENT": i
    });
  }
  this.pass({ actual: ret });
};

/*eslint no-unused-vars:0 */
GetEls.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

GetEls.prototype.command = function (selector, cb) {
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

module.exports = GetEls;
