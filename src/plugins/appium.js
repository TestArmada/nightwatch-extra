import logger from "../util/logger";
import settings from "../settings";
import _ from "lodash";

const name = "Appium Plugin";

module.exports = {
  name,

  /* eslint-disable camelcase */
  before: (globals) => {
    const test_settings = globals.test_settings;

    return new Promise((resolve, reject) => {
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

          return appium(config)
            .then((server) => {
              logger.log(`[${name}] Appium server is launched`);
              globals.appiumServer = server;

              return resolve();
            });
        } catch (e) {
          logger.err(`${name}] Appium server isn't launched successfully, ${e}`);
          // where appium isnt found
          return reject(e);
        }
      } else {
        logger.log(`[${name}] No appium is configured in nightwatch.json, skip appium start`);
        return resolve();
      }
    });
  },

  after: (globals) => {

    return new Promise((resolve, reject) => {
      if (globals.appiumServer) {
        return globals.appiumServer
          .close()
          .then(() => {
            globals.appiumServer = null;
            logger.log(`[${name}] Appium server is stopped`);
            return resolve();
          })
          .catch((err) => {
            logger.err(`[${name}] Appium server isn't stopped successfully, ${err}`);
            return reject(err);
          });
      } else {
        logger.log(`[${name}] No appium is configured in nightwatch.json, skip appium stop`);
        return resolve();
      }
    });
  }
};
