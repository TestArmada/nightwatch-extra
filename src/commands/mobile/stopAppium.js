import util from "util";
import EventEmitter from "events";
import logger from "../../util/logger";

const StopAppium = function () {
  EventEmitter.call(this);
  this.cmd = "stopappium";
};

util.inherits(StopAppium, EventEmitter);

StopAppium.prototype.fail = function (exception) {
  const self = this;

  this.client.assertion(false, false, true, this.message, true);

  logger.error("Appium failed in stopping. Exception:" + exception); //eslint-disable-line
  process.nextTick(() => {
    self.emit("complete");
  });
};

StopAppium.prototype.pass = function () {
  const self = this;

  this.client.assertion(true, true, true, this.message, true);

  process.nextTick(() => {
    self.emit("complete");
  });
};

/* eslint-disable consistent-return */
StopAppium.prototype.command = function (cb) {
  const self = this;

  if (this.client.appiumServer) {
    this.client.appiumServer
      .close()
      .then(() => {
        self.client.appiumServer = null;
        if (cb) {
          return cb();
        }
        self.pass();
      })
      .catch((err) => {
        if (cb) {
          return cb();
        }
        self.fail(err);
      });
  } else {
    if (cb) {
      return cb();
    }
    self.pass();
  }
};

module.exports = StopAppium;
