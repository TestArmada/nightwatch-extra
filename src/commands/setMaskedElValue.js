import util from "util";

import selectorUtil from "../util/selector";
import ClickEl from "./clickEl";

const KEYBOARD_DELAY = 150;
const DEFAULT_FIELDSIZE = 50;

const SetMaskedElValue = function (nightwatch = null, customizedSettings = null) {
  ClickEl.call(this, nightwatch, customizedSettings);
  this.cmd = "setmaskedelvalue";
};

util.inherits(SetMaskedElValue, ClickEl);

SetMaskedElValue.prototype.do = function (magellanSel) {
  const self = this;
  const client = self.client.api;

  // Send 50 <- keys first (NOTE: this assumes LTR text flow!)
  const backarrows = [];
  for (let i = 0; i < this.fieldSize; i++) {
    backarrows.push("\uE012");
  }

  const keys = backarrows.concat(self.valueToSet.split(""));

  const nextKey = function () {
    if (keys.length === 0) {
      client
        .pause(KEYBOARD_DELAY, () => {
          self.pass({});
        });
    } else {
      const key = keys.shift();
      client
        .pause(KEYBOARD_DELAY)
        .keys(key, () => {
          nextKey();
        });
    }
  };

  client
    .click(
    "css selector",
    `[${this.selectorPrefix}='${magellanSel}']`,
    () => {
      nextKey();
    });
};

/*eslint max-params:["error", 4] */
SetMaskedElValue.prototype.command = function (selector, valueToSet, /* optional */ fieldSize, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.valueToSet = valueToSet;

  if (typeof fieldSize === "number") {
    this.fieldSize = fieldSize;
    this.cb = cb;
  } else {
    this.fieldSize = DEFAULT_FIELDSIZE;
    this.cb = fieldSize;
  }


  this.successMessage = `Selector <${this.selector}> (masked) set value to `
    + `[${this.valueToSet}] after %d milliseconds`;
  this.failureMessage = `Selector <${this.selector}> (masked) could not set `
    + `value to [${this.valueToSet}] after %d milliseconds`;

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SetMaskedElValue;
