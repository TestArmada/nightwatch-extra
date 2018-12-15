module.exports = (function (settings) {
  // Wrap the JSON settings, and make a change that we can look for in tests
  settings.fromJs = true;
  return settings;
})(require("./nightwatch.json"));