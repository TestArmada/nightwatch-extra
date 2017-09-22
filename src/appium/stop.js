import treeUtil from "testarmada-tree-kill";
import logger from "../util/logger";

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


/* eslint-disable consistent-return,callback-return */
const stopAppium = function (client, callback) {
  if (client.appiumServer) {
    client.appiumServer
      .close()
      .then(() => {
        client.appiumServer = null;
        logger.log("Appium server is stopped");
        killZombieProcess(callback);
      })
      .catch((err) => {
        logger.err(`Appium server isn't stopped successfully, ${err}`);
        killZombieProcess(callback);
      });
  } else {
    logger.log("No appium is configured in nightwatch.json, skip appium stop");
    callback();
  }
};

module.exports = stopAppium;
