import chai from "chai";
import polyfill, { exportLegacyAssertions } from "../../../lib/polyfill";

const expect = chai.expect;

describe("Nightwatch Polyfill", () => {
  it('should add legacy properties from NW v0.x that are used by NW-extra', () => {
    const nightwatchClient = {
      settings: {
        desiredCapabilities: {},
      },
    };
    expect(nightwatchClient.assertion).to.be.undefined;
    expect(nightwatchClient.desiredCapabilities).to.be.undefined;

    polyfill(nightwatchClient);

    expect(nightwatchClient.assertion).not.to.be.undefined;
    expect(nightwatchClient.desiredCapabilities).not.to.be.undefined;
  });

  it('should wrap a legacy NW Assertion using the new NW format for assertions', () => {
    const LegacyAssertion = function () {};
    const module = {
      exports: {},
    };
    exportLegacyAssertions(LegacyAssertion, module);
    expect(module.exports.assertion).not.to.be.undefined;
    const instance = {};
    module.exports.assertion.call(instance);
    expect(instance.message).not.to.be.undefined;
    expect(instance.expected).not.to.be.undefined;
    expect(instance.pass).not.to.be.undefined;
    expect(instance.value).not.to.be.undefined;
    expect(instance.command).not.to.be.undefined;
  });
});
