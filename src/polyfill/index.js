import util from "util";

/* eslint-disable  max-params */
export const getAssertionFn = (client) => (passed, actual, expected, message) => {
  client.api.assert.ok(passed, message);
};

export default function(client) {
  if (!client) {
    return;
  }
  if (typeof client.assertion !== "function") {
    client.assertion = getAssertionFn(client);
  }

  if (!client.desiredCapabilities) {
    client.desiredCapabilities = client.settings.desiredCapabilities;
  }
}

/* eslint-disable  no-invalid-this,prefer-spread */
export const exportLegacyAssertions = function(LegacyAssertion, module) {
  const assertion = function() {
    const args = arguments;
    const instance = new LegacyAssertion(this.client);

    if (this.message === undefined) {
      this.message = "";
    }

    if (this.expected === undefined) {
      this.expected = "";
    }

    if (this.pass === undefined) {
      this.pass = () => false;
    }

    if (this.value === undefined) {
      this.value = (value) => value;
    }

    this.command = function(callback) {
      const output = instance.command.apply(instance, args);
      if (typeof callback === "function") {
        this.pass = () => true;
        return callback({});
      }
      return output;
    };
  };
  util.inherits(assertion, LegacyAssertion);
  module.exports = LegacyAssertion;
  module.exports.assertion = assertion;
};
