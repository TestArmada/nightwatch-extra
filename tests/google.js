var Test = require("../lib/base-test-class");

module.exports = new Test({

  "Load goole page": function (client) {
    client
      .url("http://www.google.com");
  },

  "wait for lage load": function (client) {
    client
      .getEl("[name='q']")
      .getEls("[name='q']", function (els) {
        console.log(els);
      });
  },

  "test elLengthGreaterThan": function (client) {
    client
      .assert.elLengthGreaterThan("[value='Google Search']", "value", 12)
      .assert.elValueContains("[value='Google Search']", "Google Search");
  },

  "type search term": function (client) {
    client
      .setElValue("[name='q']", "xixixix")
      .clearElValue("[name='q']")
      .setElValue("[name='q']", "hahaha")
      .clickEl(".lsb")
      // .clickEl("[value='Google Search']:visible")
      // .takeElScreenshot("#resultStats", "About")
      .assert.elContainsText("#resultStats", "About");
  }
});