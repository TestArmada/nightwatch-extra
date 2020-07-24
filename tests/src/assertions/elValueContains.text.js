"use strict";

import chai from "chai";
import _ from "lodash";

import ElValueContains from "../../../lib/assertions/elValueContains";

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
          value: { value: 'fake_textual_message', sel: '[name=\'q\']' },
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
          value: { value: 'fake_textual_message', sel: '[name=\'q\']' },
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


describe("ElValueContains", () => {
  let elValueContains = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    elValueContains = new ElValueContains(clientMock);
  });

  it("Initialization", () => {
    expect(elValueContains.cmd).to.equal("elvaluecontains");
  });

  describe("Pass", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("fake_textual_message");
      };

      elValueContains = new ElValueContains(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      elValueContains.command("[name='q']", "fake_textual_message");
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("fake_textual_message");
      };

      elValueContains = new ElValueContains(clientMock);
      elValueContains.command("[name='q']", "fake_textual_message");
    });
  });

  describe("Fail - assertion failure", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("invalid_fake_textual_message");
      };

      elValueContains = new ElValueContains(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      elValueContains.command("[name='q']", "invalid_fake_textual_message");
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("invalid_fake_textual_message");
      };

      elValueContains = new ElValueContains(clientMock);
      elValueContains.command("[name='q']", "invalid_fake_textual_message");
    });
  });
});