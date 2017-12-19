import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const TouchMobileEl = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "tapmobileel";
};

util.inherits(TouchMobileEl, BaseCommand);

TouchMobileEl.prototype.do = function (value) {
  this.pass({ actual: value });
};

TouchMobileEl.prototype.checkConditions = function () {
  const self = this;

  const options = {
    path: `/session/${this.client.sessionId}/touch/perform`,
    method: "POST",
    data: {
      "actions": [
        { "action": "press", "options": { "x": this.x, "y": this.y } },
        { "action": "wait", "options": { "ms": 800 } },
        { "action": "release", "options": {} }]
    }
  };

  self.protocol(options, (result) => {
    if (result.status === 0) {
      // sucessful
      self.seenCount += 1;
    }

    const elapsed = (new Date()).getTime() - self.startTime;
    if (self.seenCount >= 1 || elapsed > MAX_TIMEOUT) {
      if (self.seenCount >= 1) {
        const elapse = (new Date()).getTime();
        self.time.executeAsyncTime = elapse - self.startTime;
        self.time.seleniumCallTime = 0;
        self.do(result.value);
      } else {
        self.fail({
          code: settings.FAILURE_REASONS.BUILTIN_ELEMENT_NOT_OPERABLE,
          message: self.failureMessage
        });
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

/*eslint max-params:["error", 5] */
TouchMobileEl.prototype.command = function (x, y, cb) {
  this.cb = cb;
  this.x = x;
  this.y = y;

  this.successMessage = `Point {x:${x}, y:${y}} was tapped after %d milliseconds.`;
  this.failureMessage = `Point {x:${x}, y:${y}} wasn't tapped after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = TouchMobileEl;
