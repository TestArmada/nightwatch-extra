import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const SlowSwipeTwoStepMobileElToEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "slowswipetwostepmobileeltoel";
};

util.inherits(SlowSwipeTwoStepMobileElToEl, BaseCommand);

SlowSwipeTwoStepMobileElToEl.prototype.do = function (value) {
  const self = this;
  const client = self.client.api;

  client.getMobileEl(self.using2, self.selector2, function (result) {
    const elementId2 = result.ELEMENT;

    const options = {
      path: `/session/${self.client.sessionId}/touch/perform`,
      method: "POST",
      data: {
        "actions": [
          {"action": "longPress", "options": {"element": value.ELEMENT}},
          {"action": "wait", "options": {"ms": 25000}},
          { "action": "moveTo", "options": { "x": self.x, "y": self.y } },
          {"action": "wait", "options": {"ms": 25000}},
          {"action": "moveTo", "options": {"element": elementId2}},
          {"action": "release"}]
      }
    };

    self.protocol(options, (result) => {
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
  });
};

/*eslint max-params:["error", 5] */
SlowSwipeTwoStepMobileElToEl.prototype.command = function (using, selector, x, y, using2, selector2, cb) {
  this.selector = selector;
  this.using = using;
  this.selector2 = selector2;
  this.using2 = using2;
  this.cb = cb;
  this.x = x;
  this.y = y;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + `was swiped toward {x:${x}, y:${y}} after %d milliseconds.`;
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + `was't swiped toward {x:${x}, y:${y}} after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = SlowSwipeTwoStepMobileElToEl;
