"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import WaitForMobileElNotPresent from "../../../../lib/commands/mobile/waitForMobileElNotPresent";

const expect = chai.expect;
const assert = chai.assert;

const result = {
  status: -1,
  value: {
    message: 'An element could not be located on the page using the given search parameters.'
  },
  errorStatus: 7,
  error: 'An element could not be located on the page using the given search parameters.'
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
    elementIdClick: (el, callback) => { callback(result) }
  },
  assertion: function (result, actual, expected, message, abortonfail) { }
};


describe("WaitForMobileElNotPresent", () => {
  let waitForMobileElNotPresent = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    waitForMobileElNotPresent = new WaitForMobileElNotPresent(clientMock);

    result.status = -1;
  });

  it("Initialization", () => {
    expect(waitForMobileElNotPresent.cmd).to.equal("waitformobileelnotpresent");
  });

  it("Pass", (done) => {
    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(true);
      expect(actual).to.equal("not visible");
      expect(expected).to.equal("not visible");
      done();
    };

    waitForMobileElNotPresent = new WaitForMobileElNotPresent(clientMock);
    waitForMobileElNotPresent.command("accessibility id", "Search");
  });


  it("Fail", (done) => {
    result.status = -1;

    clientMock.assertion = function (result, actual, expected, message, abortonfail) {
      expect(result).to.equal(false);
      expect(actual).to.equal("visible");
      expect(expected).to.equal("not visible");
      done();
    };

    waitForMobileElNotPresent = new WaitForMobileElNotPresent(clientMock);
    waitForMobileElNotPresent.command("accessibility id", "Search");
    waitForMobileElNotPresent.startTime = Date.now() - 60 * 1000;
  });

});