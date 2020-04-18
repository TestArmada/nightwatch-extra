"use strict";

import chai from "chai";
import _ from "lodash";

import BaseTest from "../../lib/base-test-class";
import logger from "../../lib/util/logger";

// eat console logs
logger.output = {
  log() { },
  error() { },
  debug() { },
  warn() { }
};

const expect = chai.expect;
const assert = chai.assert;

describe("Base Test", () => {
  let baseTest = null;
  let steps = {
    "something old": function (client) { }
  };

  beforeEach(() => {
    baseTest = new BaseTest(steps, {
      isWorker: true,
      env: "local"
    });
  });

  describe("Initialization", () => {
    it("Initialization", () => {
      expect(baseTest.isWorker).to.equal(true);
      expect(baseTest["something old"]).to.be.a("function");
    });

    it("Initialization - sauce", () => {
      baseTest = new BaseTest(steps, {
        isWorker: true,
        env: "sauce"
      });

      expect(baseTest.isWorker).to.equal(true);
      expect(baseTest.env).to.equal("sauce");
      expect(baseTest["something old"]).to.be.a("function");
    });
  });

  describe("without appium", () => {
    let client = {
      globals: {
        test_settings: {
          selenium_port: 123123
        }
      },
      perform: (callback) => {
        return callback();
      }
    };

    it("Before", (done) => {
      baseTest.before(client, () => {
        expect(baseTest.failures.length).to.equal(0);
        expect(baseTest.passed).to.equal(0);
        expect(baseTest.isAsyncTimeoutSet).to.equal(false);
        expect(baseTest.isSupposedToFailInBefore).to.equal(false);
        expect(baseTest.worker).to.not.eql(null);
        done();
      });
    });

    it("AfterEach", (done) => {
      baseTest.before(client, () => {

        baseTest.results = {
          failed: 1,
          errors: 1,
          passed: 10
        };

        expect(baseTest.isAsyncTimeoutSet).to.equal(false);

        baseTest.afterEach({
          timeoutsAsyncScript: () => { },
          sessionId: "12314123",
          currentTest: { module: "fadfasdf" }
        }, () => {
          expect(baseTest.isAsyncTimeoutSet).to.equal(true);
          expect(baseTest.failures.length).to.equal(1);
          expect(baseTest.failures[0]).to.equal("fadfasdf");
          expect(baseTest.passed).to.equal(10);
          done();
        });
      });
    });

    it("BeforeEach", (done) => {
      baseTest.before(client, () => {
        expect(baseTest.isAsyncTimeoutSet).to.equal(false);

        baseTest.beforeEach({
          timeoutsAsyncScript: () => { },
          sessionId: "12314123",
          currentTest: { module: "fadfasdf" }
        });

        expect(baseTest.isAsyncTimeoutSet).to.equal(true);
        done();
      });
    });

    it("After", (done) => {
      baseTest.before(client, () => {
        baseTest.results = {
          failed: 1,
          errors: 1,
          passed: 10
        };

        baseTest.after({
          currentTest: { module: "fadfasdf" },
          end: () => { }
        }, () => {
          expect(baseTest.appiumServer).to.equal(undefined);
          done();
        });
      });
    });
  });

  describe("screenshot", () => {
    it("afterEach - fail", function (done) {
      let client = {
        sessionId: "123",
        screenshotsPath: "./tests",
        currentTest:{
          results:{
            failed: 1
          },
          module: "test dir/test file"
        },
        perform: (callback) => {
          return callback();
        },
        timeoutsAsyncScript: function timeoutsAsyncScript() {}
      };
      let metadata;
      baseTest.worker = {
        emitMetadata: (val) => {
          metadata = val;
        }
      };
      baseTest.afterEach(client, function () {
        setTimeout(() => {
          expect(metadata.screenShotPath).to.equal("./tests/test-dir/test-file/foo.png");
          done();
        }, 100);
      });
    });
  });
  describe("testCases", () => {
    it("afterEach - testCases", function (done) {
      let client = {
        sessionId: "123",
        currentTest:{
          results:{
            failed: 1,
            testcases: {
                test1: {
                    errors: 0,
                    failed: 0
                },
                test2: {
                    errors: 0,
                    failed: 1
                },
                test3: {
                    errors: 1,
                    failed: 0
                }
            }
          },
          module: "test dir/test file"
        },
        perform: (callback) => {
          return callback();
        },
        timeoutsAsyncScript: function timeoutsAsyncScript() {}
      };

      baseTest = new BaseTest({
        test1: function (client) { },
        test2: function (client) { },
        test3: function (client) { },
        test4: function (client) { }
      }, {
        isWorker: true,
        env: "local"
      });

      let metadata;
      baseTest.worker = {
        emitMetadata: (val) => {
          metadata = val;
        }
      };
      baseTest.afterEach(client, function () {
        setTimeout(() => {
          expect(metadata.testCases).to.not.eql(null);
          expect(metadata.testCases.test1).to.not.eql(null);
          expect(metadata.testCases.test1.errors).to.eql(0);
          expect(metadata.testCases.test1.failed).to.eql(0);
          expect(metadata.testCases.test2).to.not.eql(null);
          expect(metadata.testCases.test2.errors).to.eql(0);
          expect(metadata.testCases.test2.failed).to.eql(1);
          expect(metadata.testCases.test3).to.not.eql(null);
          expect(metadata.testCases.test3.errors).to.eql(1);
          expect(metadata.testCases.test3.failed).to.eql(0);
          expect(metadata.testCases.test4).to.not.eql(null);
          expect(metadata.testCases.test4.notRun).to.be.true;
          done();
        }, 100);
      });
    });
  });
  it("afterEach - error", function (done) {
    let client = {
      sessionId: "123",
      screenshotsPath: "./tests",
      currentTest:{
        results:{
          errors: 1
        },
        module: "test dir/test file"
      },
      perform: (callback) => {
        return callback();
      },
      timeoutsAsyncScript: function timeoutsAsyncScript() {}
    };
    let metadata;
    baseTest.worker = {
      emitMetadata: (val) => {
        metadata = val;
      }
    };
    baseTest.afterEach(client, function () {
      setTimeout(() => {
        expect(metadata.screenShotPath).to.equal("./tests/test-dir/test-file/foo.png");
        done();
      }, 100);
    });
  });
  it("afterEach - no_dir", function (done) {
    let client = {
      sessionId: "123",
      screenshotsPath: "./foo",
      currentTest:{
        results:{
          failed: 1
        },
        module: "test dir/test file"
      },
      perform: (callback) => {
        return callback();
      },
      timeoutsAsyncScript: function timeoutsAsyncScript() {}
    };
    let metadata;
    baseTest.worker = {
      emitMetadata: (val) => {
        metadata = val;
      }
    };
    baseTest.afterEach(client, function () {
      setTimeout(() => {
        expect(metadata.screenShotPath).to.be.undefined;
        done();
      }, 100);
    });
  });
  it("afterEach - none", function (done) {
    let client = {
      sessionId: "123",
      screenshotsPath: "./tests",
      currentTest:{
        results:{
          failed: 0
        },
        module: "test dir/test file"
      },
      perform: (callback) => {
        return callback();
      },
      timeoutsAsyncScript: function timeoutsAsyncScript() {}
    };
    let metadata;
    baseTest.worker = {
      emitMetadata: (val) => {
        metadata = val;
      }
    };
    baseTest.afterEach(client, function () {
      setTimeout(() => {
        expect(metadata.screenShotPath).to.be.undefined;
        done();
      }, 100);
    });
  });
});