import chai from "chai";
import _ from "lodash";

import BaseAssertion from "../../lib/base-mobile-assertion";
import settings from "../../lib/settings";
import Promise from "bluebird";

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
  transport: {
    runProtocolAction: (options) => {
      return new Promise(resolve => resolve(result))
    },
  },
};


describe("Base mobile assertion", () => {
  let baseAssertion = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    baseAssertion = new BaseAssertion(clientMock);
  });

  it("Initialization", () => {
    expect(baseAssertion.startTime).to.equal(0);
    expect(baseAssertion.time.totalTime).to.equal(0);
    expect(baseAssertion.time.seleniumCallTime).to.equal(0);
    expect(baseAssertion.time.executeAsyncTime).to.equal(0);
    expect(baseAssertion.selector).to.equal(null);
    expect(baseAssertion.successMessage).to.equal("");
    expect(baseAssertion.failureMessage).to.equal("");
  });

  it("Pass", () => {
    baseAssertion.startTime = (new Date()).getTime();
    baseAssertion.pass("a", "a");
  });

  it("Fail", () => {
    baseAssertion.startTime = (new Date()).getTime();
    baseAssertion.fail("a", "a");
  });

  it("Protocol", (done) => {
    baseAssertion.protocol({}, () => {
      done();
    });
  });

  describe("checkConditions", () => {
    afterEach(() => {
      result.status = 0;
    });

    it("Succeed with multi element seens", (done) => {
      baseAssertion = new BaseAssertion(clientMock);
      baseAssertion.seenCount = 0;
      baseAssertion.expected = "some_fake_value";
      baseAssertion.startTime = (new Date()).getTime();
      baseAssertion.do = (value) => {
        baseAssertion.assert(value)
      };
      baseAssertion.assert = (value, expected) => {
        expect(baseAssertion.seenCount).to.equal(1);
        expect(value.ELEMENT).to.equal("83653D51-DC1A-43E0-828A-2FA4F546849C");
        done();
      };
      baseAssertion.checkConditions();
    });

    it("fail", (done) => {
      result.status = -1;
      clientMock.assertion = () => {
        expect(baseAssertion.seenCount).to.equal(0);
        done();
      };
      baseAssertion = new BaseAssertion(clientMock);
      baseAssertion.startTime = Date.now() - 60 * 1000
      baseAssertion.seenCount = 0;
      baseAssertion.expected = "some_fake_value";

      baseAssertion.checkConditions();
    });
  });
});
