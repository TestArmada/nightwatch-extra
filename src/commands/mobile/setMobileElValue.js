import util from "util";
import BaseCommand from "../../base-mobile-command";

const SetMobileElValue = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "setmobileelvalue";
};

util.inherits(SetMobileElValue, BaseCommand);

SetMobileElValue.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdValue(value.ELEMENT, this.valueToSet, (result) => {
      if (result.status === 0) {
        self.pass(result.value);
      } else {
        self.fail(null, null, result.error);
      }
    });
};

/*eslint max-params:["error", 4] */
SetMobileElValue.prototype.command = function (using, selector, valueToSet, cb) {
  this.selector = selector;
  this.using = using;
  this.valueToSet = valueToSet;

  this.cb = cb;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + `set value to '${this.valueToSet}' after %d milliseconds.`;
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + `can't set value to '${this.valueToSet}' after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = SetMobileElValue;
