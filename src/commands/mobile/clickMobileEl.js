import util from "util";
import BaseCommand from "../../base-mobile-command";

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
        self.pass(result.value);
      } else {
        let errorMsg = null;
        if(result.error){
          if(result.error.indexOf("not visible") > -1){
            errorMsg = self.failureMessage + "[SELECTOR_NOT_VISIBLE]";
          }else{
            errorMsg = self.failureMessage + "[" + result.error + "]";
          }
        }
        self.fail(null, null, errorMsg);
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
