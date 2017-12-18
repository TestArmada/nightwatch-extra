import util from "util";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

const MoveToEl = function (nightwatch = null, customizedSettings = null) {
  ClickEl.call(this, nightwatch, customizedSettings);
  this.cmd = "movetoel";
};

util.inherits(MoveToEl, ClickEl);

MoveToEl.prototype.do = function (magellanSel) {
  const self = this;
  const now = (new Date()).getTime();
  this.time.executeAsyncTime = now - self.startTime;

  this.client.api
    .moveToElement(
    "css selector",
    `[${this.selectorPrefix}='${magellanSel}']`,
    this.xoffset,
    this.yoffset,
    () => {
      self.time.seleniumCallTime = (new Date()).getTime() - now;
      self.pass({});
    });
};

/*eslint max-params:["error", 4] */
MoveToEl.prototype.command = function (selector, xoffset, yoffset, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.xoffset = xoffset;
  this.yoffset = yoffset;

  this.successMessage = `Moved to selector <${this.selector}> after %d milliseconds`;
  this.failureMessage = `Could not move to selector <${this.selector}> after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = MoveToEl;
