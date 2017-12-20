import util from "util";
import BaseCommand from "../../base-mobile-command";
import _ from "lodash";

const MAX_ATTEMPTS = 10;
const distance = 200;
const CONDITIONAL_CHECK = 1000;

const ScrollDownToElement = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "scrolldowntoelement";
};

util.inherits(ScrollDownToElement, BaseCommand);

/* eslint-disable  max-params */
ScrollDownToElement.prototype.command =
  function (xStart, yStart, elementLocateStrategy, elementSelector, cb) {
    const self = this;
    this.selector = elementSelector;
    this.using = elementLocateStrategy;
    this.cb = cb;

    const scrollToFindElement = function (attempts) {
      if (attempts < MAX_ATTEMPTS) {
        self.client.api.getMobileElConditional(
          elementLocateStrategy,
          elementSelector,
          CONDITIONAL_CHECK,
          (result) => {
            if (!result) {
              let yEnd = yStart > distance ? yStart - distance : 1;
              let xEnd = xStart;
              if (_.toLower(self.client.api.capabilities.platformName) === "android") {
                // do nothing here
              } else if (_.toLower(self.client.api.capabilities.platformName) === "ios") {
                yEnd = -Math.abs(distance);
                xEnd = 0;
              } else {
                self.failWithMessage(`Invalid platform ${self.client.api.capabilities.platformName}`
                  + `, expected ios or android`);
              }

              self.client.api.swipeScreenTo(xStart, yStart, xEnd, yEnd, () => {
                scrollToFindElement(attempts + 1);
              });
            } else {
              self.passWithMessage(`Selector '${self.using}:${self.selector}' `
                + `was visible after scrolling`);
            }
          });

      } else {
        self.failWithMessage(`Selector '${self.using}:${self.selector}' `
          + `was not visible after scrolling ${MAX_ATTEMPTS} times`);
      }
    };

    scrollToFindElement(0);
  };

ScrollDownToElement.prototype.passWithMessage = function (passMessage) {
  const pactual = "visible";
  const pexpected = pactual;

  this.client.assertion(true, pactual, pexpected, util.format(passMessage), true);

  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

ScrollDownToElement.prototype.failWithMessage = function (failMessage) {
  const pactual = "not visible";
  const pexpected = "visible";

  this.client.assertion(false, pactual, pexpected, util.format(failMessage), true);

  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

module.exports = ScrollDownToElement;
