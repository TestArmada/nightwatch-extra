import util from "util";
import path from "path";
import sanitizeFilename from "sanitize-filename";

import selectorUtil from "../util/selector";
import BaseCommand from "../base-command";
import settings from "../settings";

const TakeScreenshot = function (nightwatch = null, customizedSettings = null) {
  BaseCommand.call(this, nightwatch, customizedSettings);
  this.cmd = "takescreenshot";
};

util.inherits(TakeScreenshot, BaseCommand);

/*eslint no-unused-vars:0 */
TakeScreenshot.prototype.injectedJsCommand = function ($el) {
  return "return $el.length > 0";
};

TakeScreenshot.prototype.command = function (title, cb) {
  this.cb = cb;

  this.successMessage = "Took a screenshot after %d milliseconds.";
  this.failureMessage = "Failed to take a screenshot after %d milliseconds.";

  const filename = `${sanitizeFilename(title)}.png`;
  const filepath = settings.screenshotPath + path.sep + filename;
  const self = this;

  this.startTime = (new Date()).getTime();

  this.client.api
    .saveScreenshot(filepath, () => {
      if (self.cb) {
        self.cb.apply(self.client.api, []);
      }
      self.pass({ actual: "save screenshot" });
    });

  return this;
};

module.exports = TakeScreenshot;
