const _ = require("lodash");
const path = require("path");
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
          try {
            const pg = require(path.resolve(process.cwd(), p));
            logger.log(`Found plugin ${pg.name}`);
            plugins.push(pg);
          } catch (e) {
            logger.err(`Error in loading plugin: ${e}, current plugin will be ignored. ` +
              `Please make sure it's configured correctly in nightwatch.json`);
          }
        });
      }
    }

    Promise
      .all(_.map(plugins, (plugin) => {

        if (plugin.before) {
          // we wrap rejection in plugin here
          return plugin
            .before(this)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`Error in plugin.before for ${plugin.name}: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
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
          // we wrap rejection in plugin here
          return plugin
            .after(this)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`Error in plugin.after for ${plugin.name}: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
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
          // we wrap rejection in plugin here
          return plugin
            .beforeEach(this, client)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`Error in plugin.beforeEach for ${plugin.name}: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
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
          // we wrap rejection in plugin here
          return plugin
            .afterEach(this, client)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`Error in plugin.afterEach for ${plugin.name}: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => callback(err));
  }
};
