import logger from "../util/logger";
import settings from "../settings";

/* eslint-disable consistent-return,callback-return,camelcase */
const startAppium = function (client, test_settings, callback) {
  if (test_settings.appium && test_settings.appium.start_process) {

    let loglevel = test_settings.appium.loglevel ?
      test_settings.appium.loglevel : "info";

    if (settings.verbose) {
      loglevel = "debug";
    }

    try {
      /*eslint-disable global-require*/
      const appium = require("appium/build/lib/main").main;

      logger.debug(JSON.stringify({
        throwInsteadOfExit: true,
        loglevel,
        // borrow selenium port here as magellan-nightwatch-plugin doesnt support appium for now
        port: test_settings.selenium_port
      }));

      appium({
        throwInsteadOfExit: true,
        loglevel,
        // borrow selenium port here as magellan-nightwatch-plugin doesnt support appium for now
        port: test_settings.selenium_port
      }).then((server) => {
        logger.log("Appium server is launched");
        client.appiumServer = server;
        callback();
      });
    } catch (e) {
      logger.err(`Appium server isn't launched successfully, ${e}`);
      // where appium isnt found
      callback(e);
    }
  } else {
    logger.log("No appium is configured in nightwatch.json, skip appium start");
    callback();
  }
};

module.exports = startAppium;
