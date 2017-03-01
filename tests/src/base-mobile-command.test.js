import chai from "chai";
import _ from "lodash";

import BaseCommand from "../../lib/base-mobile-command";
import settings from "../../lib/settings";

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
  assertion: () => { },
  runProtocolAction: (options, callback) => {
    callback(result);
    return {
      send() { }
    };
  }
};

describe("Base mobile command", () => {
  let baseCommand = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    baseCommand = new BaseCommand(clientMock);
  });

  it("Initialization", () => {
    expect(baseCommand.startTime).to.equal(0);
    expect(baseCommand.time.totalTime).to.equal(0);
    expect(baseCommand.time.seleniumCallTime).to.equal(0);
    expect(baseCommand.time.executeAsyncTime).to.equal(0);
    expect(baseCommand.selector).to.equal(null);
    expect(baseCommand.successMessage).to.equal("");
    expect(baseCommand.failureMessage).to.equal("");
  });

  it("Pass", (done) => {
    baseCommand.startTime = (new Date()).getTime();
    baseCommand.cb = () => {
      done();
    };
    baseCommand.pass("a", "a");
  });

  it("Fail", () => {
    baseCommand.startTime = (new Date()).getTime();
    baseCommand.fail("a", "a");
  });

  it("Protocol", (done) => {
    baseCommand.protocol({}, () => {
      done();
    });
  });

  describe("checkConditions", () => {
    afterEach(() => {
      result.status = 0;
    });

    it("Succeed with multi element seens", (done) => {
      baseCommand = new BaseCommand(clientMock);
      baseCommand.seenCount = 0;
      baseCommand.expected = "some_fake_value";
      baseCommand.startTime = (new Date()).getTime();
      baseCommand.do = (value) => {
        expect(baseCommand.seenCount).to.equal(3);
        expect(value.ELEMENT).to.equal("83653D51-DC1A-43E0-828A-2FA4F546849C");
        done();
      };

      baseCommand.checkConditions();
    });

    it("fail", (done) => {
      result.status = -1;
      clientMock.assertion = () => {
        expect(baseCommand.seenCount).to.equal(0);
      };
      baseCommand = new BaseCommand(clientMock);
      baseCommand.startTime = Date.now() - 60 * 1000
      baseCommand.seenCount = 0;
      baseCommand.expected = "some_fake_value";
      baseCommand.cb = () => {
        done();
      };

      baseCommand.checkConditions();
    });
  });
});
