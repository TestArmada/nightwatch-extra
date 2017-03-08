

import _ from "lodash";
import BaseTest from "../base-test-class";

export default {
  /**
   *
   * Allow {token} to be used in selectors to extract to an arbitrary selector to make
   *  automation-oriented elements easier to select.
   * This is a noop unless the BaseTestClass.selectorToken is implemented.  This should
   * be set as a function with a single param (the token to be replaced) and return the
   * replacement value.
   * ex:
   * require('./base-test-class').selectorToken = function (value) {
   *   return '[data-selector-id="' + value + '"]';
   * }
   * @param {String} selector
   * @returns {String} transformed selector
   */

  normalize(selector) {
    /* istanbul ignore if */
    if (BaseTest.selectorToken) {
      selector = selector.replace(/(\{[^\}]+\})/g, (val) => {
        // remove {} wrapper
        val = val.substring(1, val.length - 1);
        return BaseTest.selectorToken(val);
      });
    }
    return selector;
  },

  /**
   *
   * Process params of magellan JQuery function, pop up the first param (nightwatch selector),
   * and return the last element (element selector) if the selector is defined in
   * nightwatch page object pattern.
   * @param {Object} Arguments of magellan JQuery function
   * @param {String} nightwatch element locate strategy
   * @returns {String} processed element selector and locateStrategy
   */

  depageobjectize(selector, locateStrategy) {
    let ret = selector;

    if (locateStrategy === "recursion") {
      ret = _.last(selector).selector;
    }

    return ret;
  }
};
