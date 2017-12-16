import logger from "../util/logger";
import settings from "../settings";
import { argv } from "yargs";
import request from "request";
import _ from "lodash";
import path from "path";
import url from "url";

const name = "Dictionary Plugin";

module.exports = {
  name,

  before: (globals) => {
    // default location
    let dictionaryLocation = "./conf/nightwatch_dictionary.json";

    return new Promise((resolve, reject) => {

      if (argv.dictionary) {
        dictionaryLocation = argv.dictionary;

      } else if (process.env.NIGHTWATCH_ERROR_DICTIONARY) {
        dictionaryLocation = process.env.NIGHTWATCH_ERROR_DICTIONARY;

      } else {
        // no dictionary is found
        logger.log(`[${name}] No dictionary is configured, skip loading dictionary.`);
        return resolve();
      }

      logger.log(`[${name}] Found dictionary at ${dictionaryLocation}, loading dictionary`);

      const shadowURL = url.parse(dictionaryLocation);

      if (!shadowURL.protocol) {
        // a file
        try {
          global.dictionary = require(path.resolve(process.cwd(), shadowURL.href));
          logger.debug(`[${name}] ${JSON.stringify(global.dictionary, null, 2)}`);
          return resolve();
        } catch (e) {

          logger.err(`[${name}] Error in getting dictionary from ${shadowURL.href}, ${err}`);
          return reject(err);
        }

      } else {
        request.get(shadowURL.href, (err, response, body) => {

          if (err) {
            logger.err(`[${name}] Error in getting dictionary from ${shadowURL.href}, ${err}`);
            return reject(err);
          }

          globals.dictionary = _.assign({}, body);
          logger.debug(`[${name}] ${JSON.stringify(global.dictionary, null, 2)}`);
          return resolve();
        });
      }
    });
  },

  beforeEach: function (globals, client, callback) {

    const funcs = _.functions(client);

    return new Promise((resolve, reject) => {

      _.forEach(funcs, (func) => {
        const originalFunc = client[func];

        client[func] = function adaptorFn() {
          // simple adaptor
          const args = Array.prototype.slice.call(arguments);

          return originalFunc.apply(client[func], args);
        };
      });

      return resolve();

    });
  },

  afterEach: function (globals, client, callback) {

    return new Promise((resolve, reject) => {

      _.forEach(client.currentTest.results.testcases, (testcase) => {

        if (testcase.assertions.length > 0) {
          testcase.assertions = _.map(testcase.assertions, (assertion) => {
            assertion.fullMsg += " added by lei";
            assertion.failure += " added by lei";
            return assertion;
          });
        }
      });

      console.log(JSON.stringify(client.currentTest, null, 2));

      return resolve();
    });

  }
};