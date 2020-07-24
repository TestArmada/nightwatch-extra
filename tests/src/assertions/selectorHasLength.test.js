"use strict";

import chai from "chai";
import _ from "lodash";

import SelectorHasLength from "../../../lib/assertions/selectorHasLength";

const expect = chai.expect;
const assert = chai.assert;

const immutableClientMock = {
  options: {
    desiredCapabilities: {
      "browserName": "chrome",
      "javascriptEnabled": true,
      "acceptSslCerts": true,
      "platform": "Windows 10",
      "id": "chrome_latest_Windows_10_Desktop",
      "version": "55",
      "name": "Google"
    }
  },
  desiredCapabilities: {
    "browserName": "chrome",
    "javascriptEnabled": true,
    "acceptSslCerts": true,
    "platform": "Windows 10",
    "id": "chrome_latest_Windows_10_Desktop",
    "version": "55",
    "name": "Google"
  },
  locateStrategy: "css",
  api: {
    executeAsync: function (fn, args, callback) {
      callback({
        state: 'success',
        sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
        hCode: 1895546026,
        value:
        {
          isSync: false,
          selectorLength: 1,
          isVisible: true,
          isVisibleStrict: true,
          seens: 3,
          value: { value: 2, sel: '[name=\'q\']' },
          selectorVisibleLength: 1
        },
        class: 'org.openqa.selenium.remote.Response',
        status: 0
      });
    },
    execute: function (fn, args, callback) {
      callback({
        state: 'success',
        sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
        hCode: 1895546026,
        value:
        {
          isSync: true,
          selectorLength: 1,
          isVisible: true,
          isVisibleStrict: true,
          seens: 3,
          value: { value: 2, sel: '[name=\'q\']' },
          selectorVisibleLength: 1
        },
        class: 'org.openqa.selenium.remote.Response',
        status: 0
      });
    },
    pause: () => {}
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("SelectorHasLength", () => {
  let selectorHasLength = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    selectorHasLength = new SelectorHasLength(clientMock);
  });

  it("Initialization", () => {
    expect(selectorHasLength.cmd).to.equal("selectorhaslength");
  });

  describe("Pass", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal(2);
        expect(expected).to.equal(2);
      };

      selectorHasLength = new SelectorHasLength(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      selectorHasLength.command("[name='q']", 2);
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal(2);
        expect(expected).to.equal(2);
      };

      selectorHasLength = new SelectorHasLength(clientMock);
      selectorHasLength.command("[name='q']", 2);
    });
  });

  describe("Fail - assertion failure", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal(2);
        expect(expected).to.equal(3);
      };

      selectorHasLength = new SelectorHasLength(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      selectorHasLength.command("[name='q']", 3);
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal(2);
        expect(expected).to.equal(3);
      };

      selectorHasLength = new SelectorHasLength(clientMock);
      selectorHasLength.command("[name='q']", 3);
    });
  });
});