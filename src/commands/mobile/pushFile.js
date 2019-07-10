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
  this.pass(value);
};

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
