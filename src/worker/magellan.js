export default class MagellanWorker {
  constructor({ nightwatch }) {
    this.nightwatch = nightwatch;
  }

  emitSession(sessionId) {
    /* istanbul ignore if */
    if (process.send) {
      let url = "https://saucelabs.com/tests/";

      if (this.nightwatch.globals.resultUrlPrefix) {
        url = this.nightwatch.globals.resultUrlPrefix;
      }

      process.send({
        type: "test-meta-data",
        metadata: {
          resultURL: url + sessionId,
          sessionId
        }
      });
    }
  }

  handleMessage(message) {
    if (message && message.signal === "bail") {
      this.nightwatch.assert.equal(false, true, message.customMessage || "Test killed.");
    }
  }
}
