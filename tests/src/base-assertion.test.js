import chai from "chai";
import _ from "lodash";

import BaseAssertion from "../../lib/base-assertion";
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
    executeAsync: (fn, args, callback) => {
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
    execute: (fn, args, callback) => {
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
  assertion: () => { }
};

describe("Base assertion", () => {
  let baseAssertion = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    baseAssertion = new BaseAssertion(clientMock);
  });

  it("Initialization", () => {
    expect(baseAssertion.isSync).to.equal(false);
    expect(baseAssertion.startTime).to.equal(0);
    expect(baseAssertion.time.totalTime).to.equal(0);
    expect(baseAssertion.time.seleniumCallTime).to.equal(0);
    expect(baseAssertion.time.executeAsyncTime).to.equal(0);
    expect(baseAssertion.selectorPrefix).to.equal("data-magellan-temp-automation-id");
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

  describe("Decide", () => {
    it("browserstack browser name matches", () => {
      clientMock.options.desiredCapabilities = {
        "os": "ios",
        "os_version": "9.1",
        "browser": "ipad",
        "device": "iPad Pro",
        "browser_version": null,
        "deviceOrientation": "landscape"
      };

      clientMock.desiredCapabilities = {
        "os": "ios",
        "os_version": "9.1",
        "browser": "ipad",
        "device": "iPad Pro",
        "browser_version": null,
        "deviceOrientation": "landscape"
      };

      baseAssertion = new BaseAssertion(clientMock, {
        syncModeBrowserList: ["ipad"]
      });
      baseAssertion.decide();

      expect(baseAssertion.isSync).to.equal(true);
    });

    it("browserstack browser name and version matche", () => {
      clientMock.options.desiredCapabilities = {
        "os": "ios",
        "os_version": "9.1",
        "browser": "chrome",
        "device": "iPad Pro",
        "browser_version": "55.1",
        "deviceOrientation": "landscape"
      };

      clientMock.desiredCapabilities = {
        "os": "ios",
        "os_version": "9.1",
        "browser": "chrome",
        "device": "iPad Pro",
        "browser_version": "55.1",
        "deviceOrientation": "landscape"
      };

      baseAssertion = new BaseAssertion(clientMock, {
        syncModeBrowserList: ["chrome:55"]
      });
      baseAssertion.decide();

      expect(baseAssertion.isSync).to.equal(true);
    });

    it("To be async", () => {
      baseAssertion.decide();

      expect(baseAssertion.isSync).to.equal(false);
    });

    it("To be async - version no match", () => {
      baseAssertion = new BaseAssertion(clientMock, {
        syncModeBrowserList: ["chrome:54"]
      });
      baseAssertion.decide();

      expect(baseAssertion.isSync).to.equal(false);
    });

    describe("To be sync ", () => {
      it("Browser name matches", () => {
        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseAssertion.decide();

        expect(baseAssertion.isSync).to.equal(true);
      });

      it("Browser name and version match", () => {
        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome:55"]
        });
        baseAssertion.decide();

        expect(baseAssertion.isSync).to.equal(true);
      });

      it("Browser name and version match in array", () => {
        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome:55", "iphone"]
        });
        baseAssertion.decide();

        expect(baseAssertion.isSync).to.equal(true);
      });
    });
  });

  describe("Execute", () => {
    describe("Async", () => {

      it("Succeed", () => {
        let args = ["[name='q']", "return $el.length"];

        baseAssertion = new BaseAssertion(clientMock);
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
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
        clientMock.api.executeAsync = (fn, args, callback) => {
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

        baseAssertion = new BaseAssertion(clientMock);
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
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

        clientMock.api.executeAsync = (fn, args, callback) => {
          callback({
            state: 'failed',
            sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
            hCode: 1895546026,
            value:
            {
              message: "fail on puspose"
            },
            class: 'org.openqa.selenium.remote.Response',
            errorStatus: 100,
            status: -1
          });
        };

        clientMock.assertion = (result, actual, expected, message, abortonfail) => {
          expect(result).to.equal(false);
          expect(actual).to.equal(undefined);
          expect(expected).to.equal(undefined);
          expect(abortonfail).to.equal(true);
        };

        baseAssertion = new BaseAssertion(clientMock);
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
        });
      });
    });

    describe("Sync", () => {

      it("Succeed", () => {
        let args = ["[name='q']", "return $el.length"];

        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
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
        clientMock.api.execute = (fn, args, callback) => {
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

        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
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

        clientMock.api.execute = (fn, args, callback) => {
          callback({
            state: 'failed',
            sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
            hCode: 1895546026,
            value:
            {
              message: "fail on puspose"
            },
            class: 'org.openqa.selenium.remote.Response',
            errorStatus: 100,
            status: -1
          });
        };

        clientMock.assertion = (result, actual, expected, message, abortonfail) => {
          expect(result).to.equal(false);
          expect(actual).to.equal(undefined);
          expect(expected).to.equal(undefined);
          expect(abortonfail).to.equal(true);
        };

        baseAssertion = new BaseAssertion(clientMock, {
          syncModeBrowserList: ["chrome"]
        });
        baseAssertion.decide();
        baseAssertion.execute(() => { }, args, (result) => {
        });
      });
    });
  });

  describe("checkConditions", () => {
    it("Succeed with multi js seens", () => {
      let args = ["[name='q']", "return $el.length"];

      baseAssertion = new BaseAssertion(clientMock);
      baseAssertion.seenCount = 0;
      baseAssertion.expected = "some_fake_value";
      baseAssertion.startTime = (new Date()).getTime();
      baseAssertion.assert = (value, expected) => {
        expect(baseAssertion.seenCount).to.equal(1);
        expect(expected).to.equal("some_fake_value");
        expect(value).to.equal("magellan_selector_2f38e1cf");
      };
      baseAssertion.decide();
      baseAssertion.checkConditions();
    });

    it("Succeed with multi elements found warning", () => {
      let args = ["[name='q']", "return $el.length"];

      clientMock.api.executeAsync = (fn, args, callback) => {
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

      baseAssertion = new BaseAssertion(clientMock);
      baseAssertion.seenCount = 0;
      baseAssertion.expected = "some_fake_value";
      baseAssertion.startTime = (new Date()).getTime();
      baseAssertion.assert = (value, expected) => {
        expect(baseAssertion.seenCount).to.equal(1);
        expect(expected).to.equal("some_fake_value");
        expect(value).to.equal("magellan_selector_2f38e1cf");
      };
      baseAssertion.decide();
      baseAssertion.checkConditions();
    });

    it("Succeed with multi seens", (done) => {
      let args = ["[name='q']", "return $el.length"];

      clientMock.api.execute = (fn, args, callback) => {
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

      baseAssertion = new BaseAssertion(clientMock, {
        syncModeBrowserList: ["chrome:55", "iphone"]
      });
      baseAssertion.seenCount = 0;
      baseAssertion.expected = "some_fake_value";
      baseAssertion.startTime = (new Date()).getTime();
      baseAssertion.assert = (value, expected) => {
        expect(baseAssertion.seenCount).to.equal(3);
        expect(expected).to.equal("some_fake_value");
        expect(value).to.equal("magellan_selector_2f38e1cf");
        done();
      };
      baseAssertion.decide();
      baseAssertion.checkConditions();
    });
  });
});