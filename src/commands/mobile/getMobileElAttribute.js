import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const GetMobileAttribute = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "getmobileattribute";
};

util.inherits(GetMobileAttribute, BaseCommand);

GetMobileAttribute.prototype.do = function (value) {
  const self = this;

  this.client.api
    .elementIdAttribute(value.ELEMENT, this.attribute, (result) => {
      if (result.status === 0) {
        self.pass({ actual: result.value });
      } else {
        self.fail({
          code: settings.FAILURE_REASONS.BUILTIN_ELEMENT_NOT_OPERABLE,
          message: result.error
        });
      }
    });
};

GetMobileAttribute.prototype.command = function (using, selector, attribute, cb) {
  this.selector = selector;
  this.using = using;
  this.cb = cb;
  this.attribute = attribute;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
  + "was visible after %d milliseconds.";
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
  + "was not visible or no attribute of type '" + this.attribute + "'after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;``
};

module.exports = GetMobileAttribute;
