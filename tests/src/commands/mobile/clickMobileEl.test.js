"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import ClickMobileEl from "../../../../lib/commands/mobile/clickMobileEl";

const expect = chai.expect;
const assert = chai.assert;

const result = {
  status: 0,
  value:
  {
    ELEMENT: '83653D51-DC1A-43E0-828A-2FA4F546849C',
    type: 'XCUIElementTypeButton',
    label: 'Don’t Allow'
  },
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
  transport: {
    runProtocolAction: (options) => {
      return new Promise(resolve => resolve(result))
    },
  },
  api: {
    elementIdClick: (el, callback) => { callback(result) }
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("ClickMobileEl", () => {
  let clickMobileEl = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    clickMobileEl = new ClickMobileEl(clientMock);

    result.status = 0;
  });

  it("Initialization", () => {
    expect(clickMobileEl.cmd).to.equal("clickmobileel");
  });

  it("Pass", (done) => {
    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(true);
      expect(actual.ELEMENT).to.equal("83653D51-DC1A-43E0-828A-2FA4F546849C");
      expect(expected.ELEMENT).to.equal("83653D51-DC1A-43E0-828A-2FA4F546849C");
      done();
    };

    clickMobileEl = new ClickMobileEl(clientMock);
    clickMobileEl.command("accessibility id", "Search");
  });


  it("Fail in protocol call", (done) => {
    result.status = -1;

    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(false);
      expect(actual).to.equal("not visible");
      expect(expected).to.equal("visible");
      done();
    };

    clickMobileEl = new ClickMobileEl(clientMock);
    clickMobileEl.command("accessibility id", "Search");
    clickMobileEl.startTime = Date.now() - 60 * 1000;
  });

  it("Fail in selenium call", (done) => {
    clientMock.api.elementIdClick = (el, callback) => {
      callback({
        status: -1,
        value: "FAKE_ELEMENT_RETURN"
      });
    };
    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(false);
      expect(actual).to.equal("not visible");
      expect(expected).to.equal("visible");
      done();
    };

    clickMobileEl = new ClickMobileEl(clientMock);
    clickMobileEl.command("accessibility id", "Search");
  });

});
