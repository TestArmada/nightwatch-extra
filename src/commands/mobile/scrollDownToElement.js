import util from "util";
import BaseCommand from "../../base-mobile-command";

const MAX_ATTEMPTS = 10;

const ScrollDownToElement = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "scrolldowntoelement";
};

util.inherits(ScrollDownToElement, BaseCommand);

ScrollDownToElement.prototype.command = function (xStart, yStart, elementLocateStrategy, elementSelector, cb) {
  const self = this;
  this.selector = elementSelector;
  this.using = elementLocateStrategy;
  this.cb = cb;

  this.failureMessage = `Selector '${this.using}:${this.selector}' `
    + `was not visible after scrolling ${MAX_ATTEMPTS} times`;

  const scrollToFindElement = function (attempts) {

    if (attempts < MAX_ATTEMPTS) {
      self.client.api.getMobileElConditional(elementLocateStrategy,
        elementSelector, 1000,
          (result) => {
            if (!result) {
              if (self.client.api.capabilities.platformName === 'Android') {
                let yEnd = 1;
                if (yStart > 200) {
                  yEnd = yStart - 200;
                }
                self.client.api.swipeScreenTo(xStart, yStart, 10, yEnd);
              }
              else if (self.client.api.capabilities.platformName === 'iOS') {
                self.client.api.swipeScreenTo(xStart, yStart, 0, -200);
              } else {
                throw new Error('platformName not specified');
              }
              return scrollToFindElement(attempts + 1);
            } else {
              self.emit('complete');
            }
          }
      );
    } else {
      self.fail();
    }
  };
  scrollToFindElement(0);
};

ScrollDownToElement.prototype.fail = function (actual, expected) {
  const pactual = actual || "not visible";
  const pexpected = expected || "visible";
  const message = this.failureMessage;

  this.client.assertion(false, pactual, pexpected, util.format(message), true);

  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

module.exports = ScrollDownToElement;
