"use strict";

import chai from "chai";
import _ from "lodash";

import BaseTest from "../../lib/base-test-class";

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

  it("Before", () => {
    baseTest.before();

    expect(baseTest.failures.length).to.equal(0);
    expect(baseTest.passed).to.equal(0);
    expect(baseTest.isAsyncTimeoutSet).to.equal(false);
    expect(baseTest.isSupposedToFailInBefore).to.equal(false);
    expect(baseTest.worker).to.not.eql(null);
  });

  it("BeforeEach", () => {
    baseTest.before();

    expect(baseTest.isAsyncTimeoutSet).to.equal(false);

    baseTest.beforeEach({
      timeoutsAsyncScript: () => { },
      sessionId: "12314123",
      currentTest: { module: "fadfasdf" }
    });

    expect(baseTest.isAsyncTimeoutSet).to.equal(true);

  });

  it("AfterEach", () => {
    baseTest.before();

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
    });
  });

  it("After", (done) => {
    baseTest.before();

    baseTest.results = {
      failed: 1,
      errors: 1,
      passed: 10
    };

    baseTest.after({
      currentTest: { module: "fadfasdf" },
      end: () => { }
    }, () => {
      done();
    });
  });
});