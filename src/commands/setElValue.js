import util from 'util';

import selectorUtil from '../util/selector';
import ClickEl from './clickEl';

const SetElValue = function(nightwatch = null, customizedSettings = null) {
  ClickEl.call(this, nightwatch, customizedSettings);
  this.cmd = 'setelvalue';
};

util.inherits(SetElValue, ClickEl);

SetElValue.prototype.do = function(magellanSel) {
  const self = this;
  const now = new Date().getTime();
  this.time.executeAsyncTime = now - self.startTime;
  if (this.client.api.capabilities.platformName === 'iOS') {
    this.client.api.execute(
      function(selector, value) {
        var elem = document.querySelector(selector);
        if (elem) {
          elem.scrollIntoView();
          if (elem.nodeName === 'SELECT') {
            var option;
            for (var i = 0; i < elem.options.length; i++) {
              if (
                elem.options[i].text === value ||
                elem.options[i].value === value
              ) {
                option = elem.options[i].value;
                break;
              }
            }
            if (!option) {
              throw new Error(`Option [${option}] not found in select options`);
            }
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLSelectElement.prototype,
              'value'
            ).set;
            nativeInputValueSetter.call(elem, option);
            elem.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (elem.nodeName === 'TEXT') {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            nativeInputValueSetter.call(elem, value);
            elem.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            return 'EXECUTE_SELENIUM';
          }
        } else {
          throw new Error(`Element [${selector}] not found!`);
        }
      },
      [`[${this.selectorPrefix}='${magellanSel}']`, this.valueToSet],
      function(result) {
        self.time.seleniumCallTime = new Date().getTime() - now;
        if (result.status === -1) {
          //fail
          self.failureMessage =
            self.failureMessage + `. Reason ${result.value.message}`;
          self.fail({});
        } else {
          if (result.value === 'EXECUTE_SELENIUM') {
            self.client.api.setValue(
              'css selector',
              `[${this.selectorPrefix}='${magellanSel}']`,
              self.valueToSet,
              function() {
                self.pass({});
              }
            );
          } else {
            self.pass({});
          }
        }
      }
    );
  } else {
    this.client.api.setValue(
      'css selector',
      `[${this.selectorPrefix}='${magellanSel}']`,
      this.valueToSet,
      () => {
        self.time.seleniumCallTime = new Date().getTime() - now;
        self.pass({});
      }
    );
  }
};

SetElValue.prototype.command = function(selector, valueToSet, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.valueToSet = valueToSet;
  this.cb = cb;

  this.successMessage =
    `Selector <${this.selector}> set value to` +
    ` [${this.valueToSet}] after %d milliseconds`;
  this.failureMessage =
    `Selector <${this.selector}> could not set` +
    ` value to [${this.valueToSet}] after %d milliseconds`;

  this.startTime = new Date().getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;
  this.decide();
  this.checkConditions();

  return this;
};

module.exports = SetElValue;
