"use strict";

import EventEmitter from "events";
import util from "util";
import _ from "lodash";
import clc from "cli-color";
import safeJsonStringify from "json-stringify-safe";

import settings from "./settings";
import selectorUtil from "./util/selector";
import jsInjection from "./injections/js-injection";

// Wait until we've seen a selector as :visible SEEN_MAX times, with a
// wait for WAIT_INTERVAL milliseconds between each visibility test.
const MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
const WAIT_INTERVAL = settings.WAIT_INTERVAL;
const SEEN_MAX = settings.SEEN_MAX;
const JS_SEEN_MAX = settings.JS_SEEN_MAX;

let Base = function (nightwatch = null, customized_settings = null) {
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

  if (customized_settings) {
    this.syncModeBrowserList = customized_settings.syncModeBrowserList;
  }
};

util.inherits(Base, EventEmitter);

Base.prototype.decide = function () {
  let self = this;

  this.nightwatchExecute = this.client.api.executeAsync;
  this.executeSizzlejs = jsInjection.executeSizzlejsAsync;

  _.forEach(this.syncModeBrowserList, function (browser) {
    var b, v = null;
    var cap = browser.split(":");
    b = cap[0];
    if (cap.length > 1) {
      v = cap[1];
    }

    if ((!!v && self.client.desiredCapabilities.version === v && self.client.desiredCapabilities.browserName.toLowerCase() === b)
      || (!v && self.client.desiredCapabilities.browserName.toLowerCase() === b)) {
      self.isSync = true;
      self.nightwatchExecute = self.client.api.execute;
      self.executeSizzlejs = jsInjection.executeSizzlejsSync;
    }

  });
};

Base.prototype.checkConditions = function () {
  var self = this;

  this.execute(
    this.executeSizzlejs,
    [this.selector, this.injectedJsCommand()],
    (result) => {
      // Keep a running count of how many times we've seen this element visible
      if (result.isVisible) {
        self.seenCount += 1;
      }

      let elapsed = (new Date()).getTime() - self.startTime;

      // If we've seen the selector enough times or waited too long, then 
      // it's time to pass or fail and continue the command chain.
      if (result.seens >= JS_SEEN_MAX || self.seenCount >= SEEN_MAX || elapsed > MAX_TIMEOUT) {

        // Unlike clickEl, only issue a warning in the getEl() version of this
        if (result.selectorLength > 1) {
          console.log("WARNING: getEl saw selector " + self.selector + " but result length was " + result.selectorLength + ", with " + result.selectorVisibleLength + " of those :visible");
          console.log("Selector did not disambiguate after " + elapsed + " milliseconds, refine your selector or check DOM for problems.");
        }

        if (self.seenCount >= SEEN_MAX || result.seens >= JS_SEEN_MAX) {

          let elapse = (new Date()).getTime();
          self.time.executeAsyncTime = elapse - self.startTime;
          self.time.seleniumCallTime = 0;
          self.do(result.value.value);
        } else {
          self.fail();
        }
      } else {
        setTimeout(self.checkConditions, WAIT_INTERVAL);
      }
    });
};

Base.prototype.execute = function (fn, args, callback) {
  let self = this;

  let innerArgs = _.cloneDeep(args);
  let selector = selectorUtil.depageobjectize(innerArgs.shift(), this.client.locateStrategy);

  innerArgs.unshift(selector);
  innerArgs.push(jsInjection.getSizzlejsSource());
  innerArgs.push(settings.JS_WAIT_INTERNAL);
  innerArgs.push(settings.JS_SEEN_MAX);

  this.nightwatchExecute(fn, innerArgs, (result) => {
    if (settings.verbose) {
      console.log("execute(" + innerArgs + ") intermediate result: ", result);
    }
    if (result && result.status === 0 && result.value !== null) {
      // Note: by checking the result and passing result.value to the callback,
      // we are claiming that the result sent to the callback will always be truthy
      // and useful, relieving the callback from needing to check the structural
      // validity of result or result.value

      callback.call(self, result.value);
    } else if (result && result.status === -1 && result.errorStatus === 13 && result.value !== null) {
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
      console.log(clc.yellowBright("\u2622  Received error result from Selenium. Raw Selenium result object:"));
      var resultDisplay;
      try {
        resultDisplay = stringify(result);
      } catch (e) {
        resultDisplay = util.inspect(result, false, null);
      }
      console.log(clc.yellowBright(resultDisplay));
      self.fail();
    }
  });
};

Base.prototype.pass = function (actual, expected) {
  let pactual = actual || "visible";
  let pexpected = pactual;
  let message = (this.isSync ? "[sync mode] " : "") + this.successMessage;

  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, pactual, pexpected, util.format(message, this.time.totalTime), true);

  // statsd({
  //   capabilities: this.client.options.desiredCapabilities,
  //   type: "command",
  //   cmd: this.cmd,
  //   value: this.time
  // });

  if (this.cb) {
    this.cb.apply(this.client.api, [actual]);
  }
  this.emit("complete");
};

Base.prototype.fail = function (actual, expected) {
  let pactual = actual || "not visible";
  let pexpected = expected || "visible";
  let message = (this.isSync ? "[sync mode] " : "") + this.failureMessage;

  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(false, pactual, pexpected, util.format(message, this.time.totalTime), true);

  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

/**
 * All children have to implement injectedJsCommand
 * 
 */
/* istanbul ignore next */
Base.prototype.injectedJsCommand = function ($el) {
  return "";
};


/**
 * All children have to implement do
 * 
 */
/* istanbul ignore next */
Base.prototype.do = function (value) {

};

/**
 * All children have to implement command
 * 
 */
/* istanbul ignore next */
Base.prototype.command = function (selector, cb) {
  return this;
};

module.exports = Base;