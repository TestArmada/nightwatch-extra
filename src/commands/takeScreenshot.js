"use strict";

import util from "util";
import path from "path";
import clc from "cli-color";
import sanitizeFilename from "sanitize-filename";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";
import settings from "../settings";

let TakeScreenshot = function () {
  BaseCommand.call(this);
  this.cmd = "takescreenshot";
}

util.inherits(TakeScreenshot, BaseCommand);

TakeScreenshot.prototype.injectedJsCommand = function ($el) {
  return "return $el.length > 0";
}

TakeScreenshot.prototype.command = function (title, cb) {
  this.cb = cb;

  this.successMessage = "Took a screenshot after %d milliseconds.";
  this.failureMessage = "Failed to take a screenshot after %d milliseconds.";

  let filename = sanitizeFilename(title) + ".png";
  let filepath = settings.screenshotPath + path.sep + filename;
  let self = this;
  
  this.startTime = (new Date()).getTime();

  this.client.api
    .saveScreenshot(filepath, () => {
      if (self.cb) {
        self.cb.apply(self.client.api, []);
      }
      self.pass("save screenshot");
    });

  return this;
};

module.exports = TakeScreenshot;