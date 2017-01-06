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
      .setElValue("[name='q']", "hahaha")
      .clickEl("#sfdiv button")
      .assert.elContainsText("#resultStats", "About");
  },

  "jump to about page and assert": function (client) {
    client
      .clickEl("#logocont a")
      .getEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .clickEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .waitForElNotPresent("[name='q']:visible")
      .getElValue(".sitemap", function (value, sel) {
        console.log(value, sel)
      })
      .assert.elContainsText(".sitemap", "More about us")
      .assert.elContainsText(".sitemap", "\\w+")
      .assert.elNotContainsText(".sitemap", "ahhahahaha")
      .assert.selectorHasLength(".sitemap", 1)
      .assert.elLengthGreaterThan(".sitemap", "html", 100);
  },

  "move mouse to logo": function (client) {
    client
      .scrollToEl(".foot li:eq(2) a", 0, 0)
      .assert.elLengthGreaterThan(".foot li", "length", 2);
  }

});
