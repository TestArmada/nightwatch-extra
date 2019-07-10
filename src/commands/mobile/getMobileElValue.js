import util from "util";
import BaseCommand from "../../base-mobile-command";

const GetMobileElValue = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getmobileels";
};

util.inherits(GetMobileElValue, BaseCommand);

GetMobileElValue.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdValue(value.ELEMENT, (result) => {
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

GetMobileElValue.prototype.command = function (using, selector, cb) {
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

module.exports = GetMobileElValue;
