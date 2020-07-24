"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import ElLengthGreaterThan from "../../../lib/assertions/elLengthGreaterThan";

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


describe("ElLengthGreaterThan", () => {
  let elLengthGreaterThan = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
  });

  it("Initialization", () => {
    expect(elLengthGreaterThan.cmd).to.equal("ellengthgreaterthan");
  });

  describe("Pass", () => {
    describe("By value", () => {
      it("Sync", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        elLengthGreaterThan.command("[name='q']", "value", 1);
      });

      it("Async", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
        elLengthGreaterThan.command("[name='q']", "value", 1);
      });
    });

    describe("By text", () => {
      it("Sync", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        elLengthGreaterThan.command("[name='q']", "text", 1);
      });

      it("Async", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
        elLengthGreaterThan.command("[name='q']", "text", 1);
      });
    });

    describe("By html", () => {
      it("Sync", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        elLengthGreaterThan.command("[name='q']", "html", 1);
      });

      it("Async", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
        elLengthGreaterThan.command("[name='q']", "html", 1);
      });
    });

    describe("By length", () => {
      it("Sync", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        elLengthGreaterThan.command("[name='q']", "length", 1);
      });

      it("Async", () => {
        clientMock.assertion = function (result, actual, expected, message, abortonfail) {
          expect(result).to.equal(true);
          expect(actual).to.equal(2);
          expect(expected).to.equal(1);
        };

        elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
        elLengthGreaterThan.command("[name='q']", "length", 1);
      });
    });
  });

  describe("Fail", () => {
    it("Sync", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal(2);
        expect(expected).to.equal(3);
      };

      elLengthGreaterThan = new ElLengthGreaterThan(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      elLengthGreaterThan.command("[name='q']", "length", 3);
    });

    it("Async", () => {
      clientMock.assertion = function (result, actual, expected, message, abortonfail) {
        expect(result).to.equal(false);
        expect(actual).to.equal(2);
        expect(expected).to.equal(3);
      };

      elLengthGreaterThan = new ElLengthGreaterThan(clientMock);
      elLengthGreaterThan.command("[name='q']", "length", 3);
    });
  });
});