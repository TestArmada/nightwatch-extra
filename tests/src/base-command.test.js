"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import BaseCommand from "../../lib/base-command";
import settings from "../../lib/settings";

const expect = chai.expect;
const assert = chai.assert;

describe("Base command", () => {
  let baseCommand = null;
  let clientMock = {
    desiredCapabilities: {
      "browserName": "chrome",
      "javascriptEnabled": true,
      "acceptSslCerts": true,
      "platform": "Windows 10",
      "id": "chrome_latest_Windows_10_Desktop",
      "version": "55",
      "name": "Google"
    },
    api: {
      executeAsync: function () { },
      execute: function () { }
    },
    assertion: function () { }
  };

  beforeEach(() => {
    baseCommand = new BaseCommand({ client: clientMock });
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
      baseCommand = new BaseCommand({
        client: clientMock,
        customized_settings: {
          syncModeBrowserList: ["chrome:54"]
        }
      });
      baseCommand.decide();

      expect(baseCommand.isSync).to.equal(false);
    });

    describe("To be sync ", () => {
      it("Browser name matches", () => {
        baseCommand = new BaseCommand({
          client: clientMock,
          customized_settings: {
            syncModeBrowserList: ["chrome"]
          }
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });

      it("Browser name and version match", () => {
        baseCommand = new BaseCommand({
          client: clientMock,
          customized_settings: {
            syncModeBrowserList: ["chrome:55"]
          }
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });

      it("Browser name and version match in array", () => {
        baseCommand = new BaseCommand({
          client: clientMock,
          customized_settings: {
            syncModeBrowserList: ["chrome:55", "iphone"]
          }
        });
        baseCommand.decide();

        expect(baseCommand.isSync).to.equal(true);
      });
    });
  });

  describe("Execute", () => {
    
  });
});