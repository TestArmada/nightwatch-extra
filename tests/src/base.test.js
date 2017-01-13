"use strict";

import Promise from "bluebird";
import chai from "chai";
import chaiAsPromise from "chai-as-promised";
import _ from "lodash";

import BaseTest from "../../lib/base-test-class";

chai.use(chaiAsPromise);

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

  it("Initialization", () => {
    expect(baseTest.isWorker).to.equal(true);
    expect(baseTest["something old"]).to.be.a("function");
  });

  it("Before", () => {
    baseTest.before();

    expect(baseTest.failures.length).to.equal(0);
    expect(baseTest.passed).to.equal(0);
    expect(baseTest.isAsyncTimeoutSet).to.equal(false);
    expect(baseTest.notifiedListenersOfStart).to.equal(false);
    expect(baseTest.isSupposedToFailInBefore).to.equal(false);
    expect(baseTest.worker).to.not.eql(null);
  });

  it("BeforeEach", () => {
    baseTest.before();

    expect(baseTest.notifiedListenersOfStart).to.equal(false);
    expect(baseTest.isAsyncTimeoutSet).to.equal(false);

    baseTest.beforeEach({
      timeoutsAsyncScript: function () { },
      sessionId: "12314123",
      currentTest: { module: "fadfasdf" }
    });

    expect(baseTest.notifiedListenersOfStart).to.equal(true);
    expect(baseTest.isAsyncTimeoutSet).to.equal(true);
  });

  it("AfterEAch", (done) => {
    baseTest.before();

    baseTest.results = {
      failed: 1,
      errors: 1,
      passed: 10
    };

    expect(baseTest.notifiedListenersOfStart).to.equal(false);
    expect(baseTest.isAsyncTimeoutSet).to.equal(false);

    baseTest.afterEach({
      timeoutsAsyncScript: function () { },
      sessionId: "12314123",
      currentTest: { module: "fadfasdf" }
    }, () => {
      expect(baseTest.isAsyncTimeoutSet).to.equal(true);
      expect(baseTest.failures.length).to.equal(1);
      expect(baseTest.failures[0]).to.equal("fadfasdf");
      expect(baseTest.passed).to.equal(10);
      done()
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
      end: function () { }
    }, () => {
      done();
    });
  });
});