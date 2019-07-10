import logger from "../util/logger";
import settings from "../settings";
import _ from "lodash";

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
      const config = _.assign({},
        _.omit(test_settings.appium, "start_process"),
        {
          throwInsteadOfExit: true,
          loglevel,
          port: test_settings.selenium_port
        });

      logger.debug(JSON.stringify(config));

      appium(config).then((server) => {
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
