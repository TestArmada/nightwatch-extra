/**
  Use http://appium.io/docs/en/about-appium/api/ to find path, method, and data (for POST) params
  Example usage:
  client.runAppiumCommand(
  {
    path: 'appium/device/current_activity',
    // "/session/${sessionId}/" is added by runAppiumCommand, so don't include it in the path
    method: "GET"
  }, function (result) {
    console.log('Current Activity is: ' + result)
  }
);*/

import util from "util";
import BaseCommand from "../../base-mobile-command";
import settings from "../../settings";

const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;

const RunAppiumCommand = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "runappiumcommand";
};

util.inherits(RunAppiumCommand, BaseCommand);

RunAppiumCommand.prototype.do = function (value) {
  this.pass({actual: value});
};

/* eslint-disable no-magic-numbers */
RunAppiumCommand.prototype.checkConditions = function () {
  const self = this;

  self.protocol(self.options, (result) => {
    if (result.status === 0) {
      // successful
      self.seenCount += 1;
    } else if (result.status === -1 &&
      result.errorStatus === 13) {
      // method not implemented, fail immediately
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

RunAppiumCommand.prototype.command = function (options, cb) {
  this.options = options;
  // Prepend the sessionId to the path:
  this.options.path = `/session/${this.client.sessionId}/${this.options.path}`;
  this.cb = cb;

  this.successMessage =
    `Successfully hit ${this.options.path} with ${this.options.method} after %d milliseconds`;
  this.failureMessage =
    `Failed to hit ${this.options.path} with ${this.options.method} after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times selector is successfully checked by /element protocol
  this.seenCount = 0;
  this.checkConditions();

  return this;
};

module.exports = RunAppiumCommand;