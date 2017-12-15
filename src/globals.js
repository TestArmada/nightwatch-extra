const _ = require("lodash");

const logger = require("./util/logger").default;
// load plugins
const appium = require("./plugins/appium");

const plugins = [appium];

module.exports = {

  before: function (callback) {

    const userPlugins = this.test_settings.plugins;

    // load default plugin
    _.forEach(plugins, (p) => {
      logger.log(`[Plugin] Found default plugin ${p.name}`);
    });

    if (userPlugins) {
      if (!_.isArray(userPlugins)) {
        logger.warn("[Plugin] Plugins in nightwatch.json must be an array");

      } else {
        // prepare plugins if defined in nightwatch.json
        _.forEach(userPlugins, (p) => {
          logger.log(`[Plugin] Found plugin ${p.name}`);
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
