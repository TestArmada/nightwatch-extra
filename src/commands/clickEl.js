import util from "util";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

const ClickEl = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "clickel";
};

util.inherits(ClickEl, BaseCommand);

ClickEl.prototype.do = function (magellanSel) {
  const self = this;
  const now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  this.client.api.click(
    "css selector",
    `[${this.selectorPrefix}='${magellanSel}']`,
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass({});
    });
};

/*eslint no-unused-vars:0 */
ClickEl.prototype.injectedJsCommand = function ($el) {
  return "return $el[0].getAttribute('data-magellan-temp-automation-id')";
};

ClickEl.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = `Selector <${this.selector}> clicked after %d milliseconds`;
  this.failureMessage = `Selector <${this.selector}> could not be clicked after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = ClickEl;
