"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import GetEls from "../../../lib/commands/getEls";

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
    }
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("GetEls", () => {
  let getEls = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    getEls = new GetEls(clientMock);
  });

  it("Initialization", () => {
    expect(getEls.cmd).to.equal("getels");
  });

  describe("Pass", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual.length).to.equal(2);
        expect(expected.length).to.equal(2);
      };

      getEls = new GetEls(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      getEls.command("[name='q']", (value) => {
        expect(value.length).to.equal(2);
      });
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(true);
        expect(actual.length).to.equal(2);
        expect(expected.length).to.equal(2);
      };

      getEls = new GetEls(clientMock);
      getEls.command("[name='q']", (value) => {
        expect(value.length).to.equal(2);
      });
    });
  });

  describe("Fail", () => {
    it("Sync", () => {
      clientMock.api.execute = function (fn, args, callback) {
        callback({
          state: 'failed',
          sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
          hCode: 1895546026,
          value:
          {
            isSync: false,
            message: "fail on puspose"
          },
          class: 'org.openqa.selenium.remote.Response',
          errorStatus: 100,
          status: -1
        });
      };

      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("not visible");
        expect(expected).to.equal("visible");
      };

      getEls = new GetEls(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      getEls.command("[name='q']");
    });

    it("Async", () => {
      clientMock.api.executeAsync = function (fn, args, callback) {
        callback({
          state: 'failed',
          sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
          hCode: 1895546026,
          value:
          {
            isSync: false,
            message: "fail on puspose"
          },
          class: 'org.openqa.selenium.remote.Response',
          errorStatus: 100,
          status: -1
        });
      };

      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal("not visible");
        expect(expected).to.equal("visible");
      };

      getEls = new GetEls(clientMock);
      getEls.command("[name='q']");
    });
  });

  describe("checkConditions", () => {
    it("Succeed with multi js seens", () => {
      let args = ["[name='q']", "return $el.length"];

      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(getEls.seenCount).to.equal(1);
        expect(result).to.equal(true);
        expect(actual.length).to.equal(2);
        expect(expected.length).to.equal(2);
        expect(abortonfail).to.equal(true);
      };
      

      getEls = new GetEls(clientMock);
      getEls.seenCount = 0;
      getEls.startTime = (new Date()).getTime();
      getEls.decide();
      getEls.checkConditions();
    });

    it("Succeed with multi elements found warning", () => {
      let args = ["[name='q']", "return $el.length"];

      clientMock.api.executeAsync = function (fn, args, callback) {
        callback({
          state: 'success',
          sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
          hCode: 1895546026,
          value:
          {
            isSync: false,
            selectorLength: 2,
            isVisible: true,
            isVisibleStrict: true,
            seens: 3,
            value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
            selectorVisibleLength: 1
          },
          class: 'org.openqa.selenium.remote.Response',
          status: 0
        });
      };

      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(getEls.seenCount).to.equal(1);
        expect(result).to.equal(true);
        expect(actual.length).to.equal(0);
        expect(expected.length).to.equal(0);
        expect(abortonfail).to.equal(true);
      };

      getEls = new GetEls(clientMock);
      getEls.seenCount = 0;
      getEls.startTime = (new Date()).getTime();
      getEls.decide();
      getEls.checkConditions();
    });

    it("Succeed with multi seens", () => {
      let args = ["[name='q']", "return $el.length"];

      clientMock.api.execute = function (fn, args, callback) {
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
            seens: 1,
            value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
            selectorVisibleLength: 1
          },
          class: 'org.openqa.selenium.remote.Response',
          status: 0
        });
      };

      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(getEls.seenCount).to.equal(3);
        expect(result).to.equal(true);
        expect(actual.length).to.equal(0);
        expect(expected.length).to.equal(0);
        expect(abortonfail).to.equal(true);
      };

      getEls = new GetEls(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      getEls.seenCount = 0;
      getEls.startTime = (new Date()).getTime();
      
      getEls.decide();
      getEls.checkConditions();
    });
  });
});