const _ = require("lodash");

const logger = require("./util/logger").default;

// load default plugins
const appium = require("./plugins/appium");
const dictionary = require("./plugins/dictionary");

const plugins = [appium, dictionary];

module.exports = {

  before(callback) {

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
        if (plugin.before) {
          return plugin.before(this);
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => callback(err));
  },

  after(callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.after) {
          return plugin.after(this);
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => callback(err));
  },

  beforeEach(client, callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.beforeEach) {
          return plugin.beforeEach(this, client);
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => callback(err));
  },

  afterEach(client, callback) {

    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.afterEach) {
          return plugin.afterEach(this, client);
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => callback(err));
  }
};
