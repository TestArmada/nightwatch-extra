import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const StartActivity = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "startactivity";
};

util.inherits(StartActivity, BaseCommand);

StartActivity.prototype.do = function (value) {
  this.pass(value);
};

StartActivity.prototype.checkConditions = function () {
  const self = this;

  const options = {
    path: `/session/${this.client.sessionId}/appium/device/start_activity`,
    method: "POST",
    data: {
      appPackage: this.appPackage,
      appActivity: this.appActivity
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
        self.fail();
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

StartActivity.prototype.command = function (app, cb) {
  this.appPackage = app.appPackage;
  this.appActivity = app.appActivity;
  this.cb = cb;

  this.successMessage = `Activity ${this.appPackage}.${this.appActivity}`
    + " was started after %d milliseconds.";
  this.failureMessage = `Activity ${this.appPackage}.${this.appActivity}`
    + " wasn't started after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = StartActivity;
