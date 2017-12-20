

import EventEmitter from "events";
import util from "util";
import _ from "lodash";
import clc from "cli-color";
import safeJsonStringify from "json-stringify-safe";

import settings from "./settings";
import selectorUtil from "./util/selector";
import jsInjection from "./injections/js-injection";
import stats from "./util/stats";
import logger from "./util/logger";

// Wait until we've seen a selector as :visible SEEN_MAX times, with a
// wait for WAIT_INTERVAL milliseconds between each visibility test.
const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = settings.SEEN_MAX;
const JS_SEEN_MAX = settings.JS_SEEN_MAX;

const Base = function (nightwatch = null, customizedSettings = null) {
  EventEmitter.call(this);

  this.isSync = false;
  this.startTime = 0;
  this.time = {
    totalTime: 0,
    seleniumCallTime: 0,
    executeAsyncTime: 0
  };

  this.selectorPrefix = "data-magellan-temp-automation-id";
  this.selector = null;

  this.successMessage = "";
  this.failureMessage = "";

  this.checkConditions = this.checkConditions.bind(this);
  this.syncModeBrowserList = settings.syncModeBrowserList;

  // for mock and unit test
  if (nightwatch) {
    this.client = nightwatch;
  }
  if (customizedSettings) {
    this.syncModeBrowserList = customizedSettings.syncModeBrowserList;
  }
};

util.inherits(Base, EventEmitter);

Base.prototype.decide = function () {
  const self = this;

  this.nightwatchExecute = this.client.api.executeAsync;
  this.executeSizzlejs = jsInjection.executeSizzlejsAsync;

  const exam = (b, v, desiredCapabilities) => {
    if (v) {
      if (desiredCapabilities.browser
        && parseInt(desiredCapabilities.browser_version) === parseInt(v)
        && desiredCapabilities.browser.toLowerCase() === b) {
        return true;
      } else if (desiredCapabilities.browserName
        && parseInt(desiredCapabilities.version) === parseInt(v)
        && desiredCapabilities.browserName.toLowerCase() === b) {
        return true;
      }
    } else {
      /* eslint-disable  no-lonely-if */
      if (desiredCapabilities.browser
        && desiredCapabilities.browser.toLowerCase() === b) {
        return true;
      } else if (desiredCapabilities.browserName
        && desiredCapabilities.browserName.toLowerCase() === b) {
        return true;
      }
    }

    return false;
  };

  _.forEach(this.syncModeBrowserList, (browser) => {
    let b = null;
    let v = null;
    const cap = browser.split(":");
    b = cap[0];
    if (cap.length > 1) {
      v = cap[1];
    }

    if (exam(b, v, self.client.desiredCapabilities)) {
      self.isSync = true;
      self.nightwatchExecute = self.client.api.execute;
      self.executeSizzlejs = jsInjection.executeSizzlejsSync;
    }

  });
};

Base.prototype.checkConditions = function () {
  const self = this;

  this.execute(
    this.executeSizzlejs,
    [this.selector, this.injectedJsCommand()],
    (result) => {

      // Keep a running count of how many times we've seen this element visible
      if (result.isVisible) {
        self.seenCount += 1;
      }

      const elapsed = (new Date()).getTime() - self.startTime;

      // If we've seen the selector enough times or waited too long, then
      // it's time to pass or fail and continue the command chain.
      if (result.seens >= JS_SEEN_MAX ||
        self.seenCount >= SEEN_MAX ||
        elapsed > MAX_TIMEOUT) {

        // Unlike clickEl, only issue a warning in the getEl() version of this
        if (result.selectorLength > 1) {
          logger.warn(`getEl saw selector ${self.selector} but result length was ` +
            ` ${result.selectorLength}, with ${result.selectorVisibleLength}` +
            ` of those :visible`);
          logger.warn(`Selector did not disambiguate after ${elapsed} milliseconds, ` +
            "refine your selector or check DOM for problems.");
        }

        if (self.seenCount >= SEEN_MAX || result.seens >= JS_SEEN_MAX) {

          const elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;

          self.assert(result.value.value, self.expected);
        } else if (result.selectorLength > 0) {
          // element found but not passing the js visibility check
          self.fail({ code: settings.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_VISIBLE });

        } else {
          self.fail({ code: settings.FAILURE_REASONS.BUILTIN_SELECTOR_NOT_FOUND });
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

Base.prototype.execute = function (fn, args, callback) {
  const self = this;

  const innerArgs = _.cloneDeep(args);
  const selector = selectorUtil.depageobjectize(innerArgs.shift(), this.client.locateStrategy);

  innerArgs.unshift(selector);
  innerArgs.push(jsInjection.getSizzlejsSource());
  innerArgs.push(settings.JS_WAIT_INTERNAL);
  innerArgs.push(settings.JS_SEEN_MAX);

  this.nightwatchExecute(fn, innerArgs, (result) => {
    if (settings.verbose) {
      logger.log(`execute(${innerArgs}) intermediate result: ${JSON.stringify(result)}`);
    }
    /*eslint no-magic-numbers:0 */
    if (result && result.status === 0 && result.value !== null) {
      // Note: by checking the result and passing result.value to the callback,
      // we are claiming that the result sent to the callback will always be truthy
      // and useful, relieving the callback from needing to check the structural
      // validity of result or result.value

      callback.call(self, result.value);
    } else if (result && result.status === -1
      && result.errorStatus === 13 && result.value !== null) {
      // errorStatus = 13: javascript error: document unloaded while waiting for result
      // we want to reload the page
      callback.call(self, {
        seens: 0,
        jsDuration: 0,
        jsStepDuration: [],
        isResultReset: true,
        isVisibleStrict: null,
        isVisible: false,
        selectorVisibleLength: 0,
        selectorLength: 0,
        value: {
          sel: null,
          value: null
        }
      });
    } else {
      logger.warn(clc.yellowBright("\u2622  Received error result from Selenium. "
        + "Raw Selenium result object:"));
      let resultDisplay;
      try {
        resultDisplay = safeJsonStringify(result);
      } catch (e) {
        resultDisplay = util.inspect(result, false, null);
      }
      logger.warn(clc.yellowBright(resultDisplay));
      self.fail({ code: settings.FAILURE_REASONS.BUILTIN_SELENIUM_ERROR });
    }
  });
};

Base.prototype.pass = function ({ pactual, expected, message }) {
  this.time.totalTime = (new Date()).getTime() - this.startTime;
  const fmtmessage = (this.isSync ? "[sync mode] " : "") + this.message;

  this.client.assertion(true, pactual, expected,
    util.format(fmtmessage, this.time.totalTime), true);

  stats({
    capabilities: this.client.options.desiredCapabilities,
    type: "command",
    cmd: this.cmd,
    value: this.time
  });

  this.emit("complete");
};

/*eslint max-params:["error", 4] */
Base.prototype.fail = function ({ code, pactual, expected, message }) {
  // if no code here we do nothing
  const pcode = code ? code : "";

  this.time.totalTime = (new Date()).getTime() - this.startTime;
  const fmtmessage = `${this.isSync ? "[sync mode] " : ""}${this.message} [[${pcode}]]`;

  this.client.assertion(false, pactual, expected,
    util.format(fmtmessage, this.time.totalTime), true);
  this.emit("complete");
};

/**
 * All children have to implement injectedJsCommand
 *
 */
/* istanbul ignore next */
/*eslint no-unused-vars:0 */
Base.prototype.injectedJsCommand = function ($el) {
  return "";
};


/**
 * All children have to implement do
 *
 */
/* istanbul ignore next */
/*eslint no-unused-vars:0 */
Base.prototype.assert = function (actual, expected) {

};

/**
 * All children have to implement command
 *
 */
/* istanbul ignore next */
/*eslint no-unused-vars:0 */
Base.prototype.command = function (selector, expected, cb) {
  return this;
};

module.exports = Base;
