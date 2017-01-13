"use strict";

import util from "util";
import clc from "cli-color";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";

let WautForElNotPresent = function () {
  BaseCommand.call(this);
  this.cmd = "waitforelementnotpresent";
}

util.inherits(WautForElNotPresent, BaseCommand);

WautForElNotPresent.prototype.do = function (value) {
  this.pass(value);
};

WautForElNotPresent.prototype.checkConditions = function () {
  var self = this;

  this.execute(
    this.executeSizzlejs,
    [this.selector, this.injectedJsCommand()],
    (result) => {
      var elapsed = (new Date()).getTime() - self.startTime;

      if (result.isVisibleStrict === false || elapsed > MAX_TIMEOUT) {

        if (result.isVisibleStrict === false) {
          var elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;
          self.do("not present");
        } else {
          self.fail("not present", "still present");
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

WautForElNotPresent.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
}

WautForElNotPresent.prototype.command = function (selector, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.successMessage = "Selector '" + this.selector + "' successfully disappeared after %d milliseconds.";
  this.failureMessage = "Selector '" + this.selector + "' failed to disappear after %d milliseconds.";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = WautForElNotPresent;