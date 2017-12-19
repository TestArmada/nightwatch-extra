const _ = require("lodash");

const logger = require("./util/logger").default;

// load default plugins
const appium = require("./plugins/appium");
const dictionary = require("./plugins/dictionary");

const plugins = [appium, dictionary];

module.exports = {

  before: function (callback) {

    const userPlugins = this.test_settings.plugins;

    // load default plugin
    _.forEach(plugins, (p) => {
      logger.log(`Found default plugin ${p.name}`);
    });

    if (userPlugins) {
      if (!_.isArray(userPlugins)) {
        logger.warn("Plugins in nightwatch.json must be an array");

      } else {
        // prepare plugins if defined in nightwatch.json
        _.forEach(userPlugins, (p) => {
          logger.log(`Found plugin ${p.name}`);
          plugins.push(p);
        });
      }
    }

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin["before"]) {
          return plugin["before"](this);
        }
      }))
      .then(() => {
        callback();
      })
      .catch(err => {
        callback(err);
      });
  },

  after: function (callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin["after"]) {
          return plugin["after"](this);
        }
      }))
      .then(() => {
        callback();
      })
      .catch(err => {
        callback(err);
      });
  },

  beforeEach: function (client, callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin["beforeEach"]) {
          return plugin["beforeEach"](this, client);
        }
      }))
      .then(() => {
        callback();
      })
      .catch(err => {
        callback(err);
      });
  },

  afterEach: function (client, callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin["afterEach"]) {
          return plugin["afterEach"](this, client);
        }
      }))
      .then(() => {
        callback();
      })
      .catch(err => {
        callback(err);
      });
  }
};
