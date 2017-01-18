var Base = require("../lib/base-test-class");
var util = require("util");

var CustomizedBaseTest = function (steps) {
  // call super-constructor
  Base.call(this, steps);
};

util.inherits(CustomizedBaseTest, Base);

CustomizedBaseTest.prototype = {
  before: function (client) {
    // call super-before
    // do basic set up here.
    Base.prototype.before.call(this, client);
  },

  after: function (client, callback) {
    // call super-after
    // do the tear down here.
    Base.prototype.after.call(this, client, callback);
  }
};

module.exports = CustomizedBaseTest;