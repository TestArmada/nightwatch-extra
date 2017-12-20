import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const PushFile = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "pushfile";
};

util.inherits(PushFile, BaseCommand);

PushFile.prototype.do = function (value) {
  this.pass({ actual: value });
};

/* eslint-disable no-magic-numbers */
PushFile.prototype.checkConditions = function () {
  const self = this;

  const options = {
    path: `/session/${this.client.sessionId}/appium/device/push_file`,
    method: "POST",
    data: this.file
  };

  self.protocol(options, (result) => {
    if (result.status === 0) {
      // sucessful
      self.seenCount += 1;
    } else if (result.status === -1 &&
      result.errorStatus === 13) {
      // method not implement, fail immediately
      self.fail({
        code: settings.FAILURE_REASONS.BUILTIN_COMMAND_NOT_SUPPORTED,
        message: self.failureMessage
      });
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
          code: settings.FAILURE_REASONS.BUILTIN_COMMAND_TIMEOUT,
          message: self.failureMessage
        });
      }
    } else {
      setTimeout(self.checkConditions, WAIT_INTERVAL);
    }
  });
};

PushFile.prototype.command = function (file, cb) {
  this.file = file;
  this.cb = cb;

  this.successMessage = `File ${file.path} was pushed after %d milliseconds.`;
  this.failureMessage = `File ${file.path} wasn't pushed after %d milliseconds.`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = PushFile;
