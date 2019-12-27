"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import GetMobileEl from "../../../../lib/commands/mobile/getMobileEl";

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
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("GetMobileEl", () => {
  let getMobileEl = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    getMobileEl = new GetMobileEl(clientMock);

    result.status = 0;
  });

  it("Initialization", () => {
    expect(getMobileEl.cmd).to.equal("getmobileel");
  });

  it("Pass", (done) => {
    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(true);
      expect(actual).to.be.an("object");
      expect(expected).to.be.an("object");
      done();
    };

    getMobileEl = new GetMobileEl(clientMock);
    getMobileEl.command("accessibility id", "Search");
  });


  it("Fail", (done) => {
    result.status = -1;

    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(false);
      expect(actual).to.equal("not visible");
      expect(expected).to.equal("visible");
      done();
    };

    getMobileEl = new GetMobileEl(clientMock);
    getMobileEl.command("accessibility id", "Search");
    getMobileEl.startTime = Date.now() - 60 * 1000;
  });

});
