import util from "util";
import EventEmitter from "events";
import logger from "../../util/logger";
import settings from "../../settings";

const StartAppium = function () {
  EventEmitter.call(this);
  this.cmd = "startappium";
};

util.inherits(StartAppium, EventEmitter);

StartAppium.prototype.fail = function (exception) {
  const self = this;

  this.client.assertion(false, false, true, this.message, true);

  logger.error("Appium failed in starting. Exception:" + exception); //eslint-disable-line
  process.nextTick(() => {
    self.emit("complete");
  });
};

StartAppium.prototype.pass = function () {
  const self = this;

  this.client.assertion(true, true, true, this.message, true);

  process.nextTick(() => {
    self.emit("complete");
  });
};

/* eslint-disable consistent-return,camelcase */
StartAppium.prototype.command = function (cb) {
  const self = this;
  const test_settings = this.client.globals.test_settings;

  if (test_settings.appium && test_settings.appium.start_process) {

    let loglevel = test_settings.appium.loglevel ?
      test_settings.appium.loglevel : "info";

    if (settings.verbose) {
      loglevel = "debug";
    }

    try {
      if (!this.appium) {
        // not mocked
        /*eslint-disable global-require*/
        this.appium = require("appium/build/lib/main").main;
      }

      this.appium({
        throwInsteadOfExit: true,
        loglevel,
        // borrow selenium port here as magellan-nightwatch-plugin doesnt support appium for now
        port: test_settings.selenium_port
      }).then((server) => {
        self.client.appiumServer = server;
        if (cb) {
          return cb();
        }
        self.pass();
      });
    } catch (e) {
      // where appium isnt found
      if (cb) {
        return cb(e);
      }
      self.fail(e);
    }
  } else {
    if (cb) {
      return cb();
    }
    self.pass();
  }
};

module.exports = StartAppium;
