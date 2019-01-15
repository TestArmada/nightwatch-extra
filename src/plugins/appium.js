import logger from "../util/logger";
import settings from "../settings";
import _ from "lodash";
import treeUtil from "testarmada-tree-kill";

const name = "Appium Plugin";
const pid = process.pid;

// Max time before we forcefully kill child processes left over after a suite run
const ZOMBIE_POLLING_MAX_TIME = 10000;

const killZombieProcess = (callback) => {
  logger.debug("Checking for zombie child processes...");

  treeUtil.getZombieChildren(pid, ZOMBIE_POLLING_MAX_TIME, (zombieChildren) => {
    if (zombieChildren.length > 0) {
      logger.log("Giving up waiting for zombie child processes to die. Cleaning up..");
      /* eslint-disable consistent-return,callback-return */
      const killNextZombie = () => {
        if (zombieChildren.length > 0) {
          const nextZombieTreePid = zombieChildren.shift();
          logger.log(`Killing pid and its child pids: ${ nextZombieTreePid}`);
          treeUtil.kill(nextZombieTreePid, "SIGKILL", killNextZombie);
        } else {
          logger.log("Done killing zombies.");
          return callback();
        }
      };

      return killNextZombie();
    } else {
      logger.debug("No zombies found.");
      return callback();
    }
  });
};


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
            return killZombieProcess(resolve);
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
