var util = require("util");
var sanitizeFilename = require("sanitize-filename");

var settings = require("../settings");
var BaseElCommand = require("./base/baseElCommand");


function Screenshot(nightwatch, customized_settings) {
  BaseElCommand.call(this, nightwatch, customized_settings);
}

util.inherits(Screenshot, BaseElCommand);

Screenshot.prototype.command = function (title, cb) {
  var self = this;

  this.cb = cb;

  this.successMessage = "Took a screenshot after %d milliseconds.";
  this.failureMessage = "Failed to take a screenshot after %d milliseconds.";

  var filename = sanitizeFilename(title) + ".png";
  var path = settings.screenshotPath + "/" + filename;

  this.client.api
    .saveScreenshot(path, function () {
      if (self.cb) {
        self.cb.apply(self.client.api, []);
      }
      self.pass("save screenshot");
    });
  
  return this;
};

module.exports = Screenshot;
