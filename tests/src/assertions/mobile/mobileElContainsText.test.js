"use strict";

import chai from "chai";
import _ from "lodash";

import MobileElContainsText from "../../../../lib/assertions/mobile/mobileElContainsText";

const expect = chai.expect;
const assert = chai.assert;

const result = {
    status: 0,
    value: "fake_textual_message",
    sessionId: '92e31313-7193-4279-942a-50bada46bd31'
  };

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
  runProtocolAction: (options, callback) => {
    callback(result);
    return {
      send() { }
    };
  },
  api: {
    elementIdText: (el, callback) => { callback(result) },
    elementIdAttribute: (el, attr, callback) => { callback(result) }
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("MobileElContainsText", () => {
  let mobileElContainsText = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    mobileElContainsText = new MobileElContainsText(clientMock);
  });

  it("Initialization", () => {
    expect(mobileElContainsText.cmd).to.equal("mobileElContainsText");
  });

  describe("Pass", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("fake_textual_message");
      };

      mobileElContainsText = new MobileElContainsText(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      mobileElContainsText.command("whatever", "[name='q']", "fake_textual_message");
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("fake_textual_message");
      };

      mobileElContainsText = new MobileElContainsText(clientMock);
      mobileElContainsText.command("whatever", "[name='q']", "fake_textual_message");
    });
  });

  describe("Fail - assertion failure", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("invalid_fake_textual_message");
      };

      mobileElContainsText = new MobileElContainsText(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      mobileElContainsText.command("whatever", "[name='q']", "invalid_fake_textual_message");
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("fake_textual_message");
        expect(expected).to.equal("invalid_fake_textual_message");
      };

      mobileElContainsText = new MobileElContainsText(clientMock);
      mobileElContainsText.command("whatever", "[name='q']", "invalid_fake_textual_message");
    });
  });
});