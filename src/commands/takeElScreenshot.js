import jimp from "jimp";
import path from "path";
import util from "util";
import sanitizeFilename from "sanitize-filename";

import selectorUtil from "../util/selector";
import settings from "../settings";
import GetEl from "./getEl";

const TakeElScreenshot = function (nightwatch = null, customizedSettings = null) {
  GetEl.call(this, nightwatch, customizedSettings);
  this.cmd = "takeelscreenshot";
};

util.inherits(TakeElScreenshot, GetEl);

/*eslint-disable max-nested-callbacks*/
TakeElScreenshot.prototype.do = function (magellanSel) {
  const self = this;
  const now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  const sel = `[${this.selectorPrefix}=${magellanSel}]`;
  const filepath = path.resolve(`${settings.screenshotPath + path.sep}`
    + `${sanitizeFilename(self.filename)}.png`);

  this.client.api.getLocation(sel, (location) => {
    self.client.api.getElementSize(sel, (size) => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;

      self.client.api
        .screenshot(false, (result) => {
          jimp.read(new Buffer(result.value, "base64"), (err, image) => {

            if (err) {
              self.fail({});
            }

            image.crop(
              location.value.x,
              location.value.y,
              size.value.width,
              size.value.height)
              .write(filepath, () => self.pass({}));
          });
        });
    });
  });
};

/*eslint no-unused-vars:0 */
TakeElScreenshot.prototype.injectedJsCommand = function ($el) {
  return "return $el[0].getAttribute('data-magellan-temp-automation-id')";
};

TakeElScreenshot.prototype.command = function (selector, filename, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.filename = filename;
  this.cb = cb;

  this.successMessage = `Screenshot for selector <${this.selector}> `
    + "is taken after %d milliseconds";
  this.failureMessage = "Failed to take screenshot for selector "
    + `<${this.selector}> after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = TakeElScreenshot;
