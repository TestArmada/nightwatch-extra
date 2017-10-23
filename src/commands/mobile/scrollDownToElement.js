import util from "util";
import BaseCommand from "../../base-mobile-command";

const ScrollDownToElement = function (nightwatch = null) {
  BaseCommand.call(this, nightwatch);
  this.cmd = "scrolldowntoelement";
};

util.inherits(ScrollDownToElement, BaseCommand);

ScrollDownToElement.prototype.command = function (xStart, yStart, xEnd, yEnd, elementLocateStrategy, elementSelector, maxAttempts) {
  const self = this;

  const scrollToFindElement = function (maxAttempts, attempts) {

    if (attempts < maxAttempts) {
      self.client.api.getMobileElConditional(elementLocateStrategy,
        elementSelector, 1000,
          (result) => {
            if (!result) {
              self.client.api.swipeScreenTo(xStart, yStart, xEnd, yEnd);
              return scrollToFindElement(maxAttempts, attempts + 1);
            } else {
              self.emit('complete');
            }
          }
      );
    } else {
      self.fail();
    }
  };

  scrollToFindElement(maxAttempts, 0);
};

module.exports = ScrollDownToElement;
