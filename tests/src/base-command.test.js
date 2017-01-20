"use strict";

import chai from "chai";
import _ from "lodash";

import BaseCommand from "../../lib/base-command";
import settings from "../../lib/settings";

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
          value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
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
          value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
          selectorVisibleLength: 1
        },
        class: 'org.openqa.selenium.remote.Response',
        status: 0
      });
    }
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};

describe("Base command", () => {
  let baseCommand = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    baseCommand = new BaseCommand(clientMock);
  });

  it("Initialization", () => {
    expect(baseCommand.isSync).to.equal(false);
    expect(baseCommand.startTime).to.equal(0);
    expect(baseCommand.time.totalTime).to.equal(0);
    expect(baseCommand.time.seleniumCallTime).to.equal(0);
    expect(baseCommand.time.executeAsyncTime).to.equal(0);
    expect(baseCommand.selectorPrefix).to.equal("data-magellan-temp-automation-id");
    expect(baseCommand.selector).to.equal(null);
    expect(baseCommand.successMessage).to.equal("");
    expect(baseCommand.failureMessage).to.equal("");
  });

  it("Pass", () => {
    baseCommand.startTime = (new Date()).getTime();
    baseCommand.pass("a", "a");

  });

  it("Fail", () => {
    baseCommand.startTime = (new Date()).getTime();
    baseCommand.fail("a", "a");

  });

  describe("Decide", () => {
    it("To be async", () => {
      baseCommand.decide();

      expect(baseCommand.isSync).to.equal(false);
    });

    it("To be async - version no match", () => {
      baseCommand = new BaseCommand(clientMock, {
        syncModeBrowserList: ["chrome:54"]
      });
      baseCommand.decide();

      expect(baseCommand.isSync).to.equal(false);
    });

    describe("To be sync ", () => {
      it("Browser name matches", () => {
        baseCommand = new BaseCommand(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });

      it("Browser name and version match", () => {
        baseCommand = new BaseCommand(clientMock, {
          syncModeBrowserList: ["chrome:55"]
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });

      it("Browser name and version match in array", () => {
        baseCommand = new BaseCommand(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });
    });
  });

  describe("Execute", () => {
    describe("Async", () => {

      it("Succeed", () => {
        let args = ["[name='q']", "return $el.length"];

        baseCommand = new BaseCommand(clientMock);
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
          expect(result.value.value).to.equal("magellan_selector_2f38e1cf");
          expect(result.value.sel).to.equal("[name='q']");
          expect(result.selectorLength).to.equal(1);
          expect(result.isVisible).to.equal(true);
          expect(result.isVisibleStrict).to.equal(true);
          expect(result.seens).to.equal(3);
          expect(result.isSync).to.equal(false);
          expect(result.selectorVisibleLength).to.equal(1);
        });
      });

      it("Not seen", () => {
        let args = ["[name='q']", "return $el.length"];
        clientMock.api.executeAsync = function (fn, args, callback) {
          callback({
            state: 'failed',
            sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
            hCode: 1895546026,
            value:
            {
              isSync: false,
              selectorLength: 1,
              isVisible: true,
              isVisibleStrict: true,
              seens: 3,
              value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
              selectorVisibleLength: 1
            },
            class: 'org.openqa.selenium.remote.Response',
            errorStatus: 13,
            status: -1
          });
        };

        baseCommand = new BaseCommand(clientMock);
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
          expect(result.value.value).to.equal(null);
          expect(result.value.sel).to.equal(null);
          expect(result.selectorLength).to.equal(0);
          expect(result.isVisible).to.equal(false);
          expect(result.isVisibleStrict).to.equal(null);
          expect(result.seens).to.equal(0);
          expect(result.isSync).to.equal(undefined);
          expect(result.selectorVisibleLength).to.equal(0);
        });
      });

      it("Fail", () => {
        let args = ["[name='q']", "return $el.length"];

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
          expect(abortonfail).to.equal(true);
        };

        baseCommand = new BaseCommand(clientMock);
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
        });
      });
    });

    describe("Sync", () => {

      it("Succeed", () => {
        let args = ["[name='q']", "return $el.length"];

        baseCommand = new BaseCommand(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
          expect(result.value.value).to.equal("magellan_selector_2f38e1cf");
          expect(result.value.sel).to.equal("[name='q']");
          expect(result.selectorLength).to.equal(1);
          expect(result.isVisible).to.equal(true);
          expect(result.isVisibleStrict).to.equal(true);
          expect(result.seens).to.equal(3);
          expect(result.isSync).to.equal(true);
          expect(result.selectorVisibleLength).to.equal(1);
        });
      });

      it("Not seen", () => {
        let args = ["[name='q']", "return $el.length"];
        clientMock.api.executeAsync = function (fn, args, callback) {
          callback({
            state: 'failed',
            sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
            hCode: 1895546026,
            value:
            {
              isSync: true,
              selectorLength: 1,
              isVisible: true,
              isVisibleStrict: true,
              seens: 3,
              value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
              selectorVisibleLength: 1
            },
            class: 'org.openqa.selenium.remote.Response',
            errorStatus: 13,
            status: -1
          });
        };

        baseCommand = new BaseCommand(clientMock);
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
          expect(result.value.value).to.equal(null);
          expect(result.value.sel).to.equal(null);
          expect(result.selectorLength).to.equal(0);
          expect(result.isVisible).to.equal(false);
          expect(result.isVisibleStrict).to.equal(null);
          expect(result.seens).to.equal(0);
          expect(result.isSync).to.equal(undefined);
          expect(result.selectorVisibleLength).to.equal(0);
        });
      });

      it("Fail", () => {
        let args = ["[name='q']", "return $el.length"];

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
          expect(abortonfail).to.equal(true);
        };

        baseCommand = new BaseCommand(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        baseCommand.decide();
        baseCommand.execute(() => { }, args, (result) => {
        });
      });
    });
  });

  describe("checkConditions", () => {
    it("Succeed with multi js seens", () => {
      let args = ["[name='q']", "return $el.length"];

      baseCommand = new BaseCommand(clientMock);
      baseCommand.seenCount = 0;
      baseCommand.startTime = (new Date()).getTime();
      baseCommand.do = function (value) {
        expect(baseCommand.seenCount).to.equal(1);
        expect(value).to.equal("magellan_selector_2f38e1cf");
      };
      baseCommand.decide();
      baseCommand.checkConditions();
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

      baseCommand = new BaseCommand(clientMock);
      baseCommand.seenCount = 0;
      baseCommand.startTime = (new Date()).getTime();
      baseCommand.do = function (value) {
        expect(baseCommand.seenCount).to.equal(1);
        expect(value).to.equal("magellan_selector_2f38e1cf");
      };
      baseCommand.decide();
      baseCommand.checkConditions();
    });

    it("Succeed with multi seens", (done) => {
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

      baseCommand = new BaseCommand(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      baseCommand.seenCount = 0;
      baseCommand.startTime = (new Date()).getTime();
      baseCommand.do = function (value) {
        expect(baseCommand.seenCount).to.equal(3);
        expect(value).to.equal("magellan_selector_2f38e1cf");
        done();
      };
      baseCommand.decide();
      baseCommand.checkConditions();
    });
  });
});