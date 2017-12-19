import util from "util";
import BaseCommand from "../../base-mobile-command";

const GetMobileEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getmobileel";
};

util.inherits(GetMobileEl, BaseCommand);

GetMobileEl.prototype.do = function (value) {
  this.pass({ actual: value });
};

GetMobileEl.prototype.command = function (using, selector, cb) {
  this.selector = selector;
  this.using = using;
  this.cb = cb;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + "was visible after %d milliseconds.";
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + "was not visible after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = GetMobileEl;
