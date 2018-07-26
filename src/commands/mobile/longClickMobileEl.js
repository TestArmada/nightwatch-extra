import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const LongClickMobileEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "longclickmobileel";
};

util.inherits(LongClickMobileEl, BaseCommand);

LongClickMobileEl.prototype.do = function (value) {
  const self = this;

  const options = {
    path: `/session/${this.client.sessionId}/touch/perform`,
    method: "POST",
    data: {
      "actions": [
        { "action": "longPress", "options": { "element": value.ELEMENT } },
        { "action": "wait", "options": { "ms": 2000 } },
        { "action": "release", "options": {} }]
    }
  };

  this.protocol(options, (result) => {
    if (result.status === 0) {
      self.pass({
        actual: result.value
      });
    } else {
      self.fail({
        code: settings.FAILURE_REASONS.BUILTIN_ELEMENT_NOT_OPERABLE,
        message: self.failureMessage
      });
    }
  });
};

/*eslint max-params:["error", 5] */
LongClickMobileEl.prototype.command = function (using, selector, cb) {
  this.selector = selector;
  this.using = using;
  this.cb = cb;
  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + `was long pressed after %d milliseconds.`;
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + `was't long pressed after after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = LongClickMobileEl;
