import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const SwipeMobileElToEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "swipemobileeltoel";
};

util.inherits(SwipeMobileElToEl, BaseCommand);


SwipeMobileElToEl.prototype.do = function (value) {
  const self = this;
  const client = self.client.api;

  // Get location of element 2, then drag element1 to element2
  client.getMobileEl(self.using2, self.selector2, function (result) {
    const elementId2 = result.ELEMENT;

    const options = {
      path: `/session/${self.client.sessionId}/touch/perform`,
      method: "POST",
      data: {
        "actions": [
          {"action": "press", "options": {"element": value.ELEMENT}},
          {"action": "wait", "options": {"ms": 800}},
          {"action": "moveTo", "options": {'element': elementId2}},
          {"action": "release", "options": {}}]
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
}
;

/*eslint max-params:["error", 5] */
SwipeMobileElToEl.prototype.command = function (using, selector, using2, selector2, cb) {
  this.selector = selector;
  this.using = using;
  this.selector2 = selector2;
  this.using2 = using2;
  this.cb = cb;

  this.successMessage = `Selector '${this.using}:${this.selector}' `
    + `was swiped to selector '${this.using2}:${this.selector2}' after %d milliseconds.`;
  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + `was not swiped to selector '${this.using2}:${this.selector2}' after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = SwipeMobileElToEl;
