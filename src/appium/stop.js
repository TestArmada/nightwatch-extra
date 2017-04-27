import logger from "../util/logger";

/* eslint-disable consistent-return,callback-return */
const stopAppium = function (client, callback) {
  if (client.appiumServer) {
    client.appiumServer
      .close()
      .then(() => {
        client.appiumServer = null;
        logger.log("Appium server is stopped");
        callback();
      })
      .catch((err) => {
        logger.err(`Appium server isn't stopped successfully, ${ err}`);
        callback(err);
      });
  } else {
    logger.log("No appium is configured in nightwatch.json, skip appium stop");
    callback();
  }
};

module.exports = stopAppium;
