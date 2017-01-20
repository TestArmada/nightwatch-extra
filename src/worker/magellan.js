export default class MagellanWorker {
  constructor({nightwatch}) {
    this.nightwatch = nightwatch;
  }

  emitTestStart(testName) {
    // Note: This is for Magellan versions earlier than 8 and will be ignored by
    // magellan versions 8 and above.
    /* istanbul ignore if */
    if (process.send) {
      process.send({
        type: "worker-status",
        status: "started",
        name: testName
      });
    }
  }

  emitTestStop({testName, testResult, metaData}) {
    /* istanbul ignore if */
    if (process.send) {
      process.send({
        type: "worker-status",
        status: "finished",
        name: testName,
        passed: testResult,
        metadata: metaData
        //  {
        //   resultURL: sauce.getTestUrl(client),
        //   // Note: browserErrors has been deprecated, but we don't want to regress
        //   // versions of magellan that consume this property, so we pass it along.
        //   browserErrors: []
        // }
      });
    }
  }

  emitSession(sessionId) {
    /* istanbul ignore if */
    if (process.send) {
      process.send({
        type: "selenium-session-info",
        sessionId
      });
    }
  }

  handleMessage(message) {
    if (message && message.signal === "bail") {
      this.nightwatch.assert.equal(false, true, message.customMessage || "Test killed.");
    }
  }
}
