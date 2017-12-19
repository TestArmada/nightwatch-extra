import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const ClickMobileEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "clickmobileel";
};

util.inherits(ClickMobileEl, BaseCommand);

ClickMobileEl.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdClick(value.ELEMENT, (result) => {
      if (result.status === 0) {
        self.pass({
          actual: result.value
        });
      } else {
        self.fail({
          code: settings.FAILURE_REASONS.BUILTIN_ELEMENT_NOT_OPERABLE,
          message: result.error
        });
      }
    });
};

ClickMobileEl.prototype.command = function (using, selector, cb) {
  this.selector = selector;
  this.using = using;
  this.cb = cb;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + "was clicked after %d milliseconds.";
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + "was not clicked after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = ClickMobileEl;
