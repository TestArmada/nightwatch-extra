import logger from "../util/logger";
import settings from "../settings";
import { argv } from "yargs";
import request from "request";
import _ from "lodash";
import path from "path";
import url from "url";

const name = "Dictionary Plugin";


const _lookUpInDictionary = (msg, dictionary) => {
  // strip error template and fill info from dictionary
  const fm = msg.match(/\[\[\w+\]\]/);

  if (fm) {

    const key = _.trim(fm[0], "[]");
    const explanation = dictionary[key] || // from customized dictionary
      dictionary[`BUILTIN_${key}`]; // from default dictionary

    if (explanation) {
      // entry found
      if (typeof explanation === "function") {
        return msg.replace(fm, explanation());
      } else {
        return msg.replace(fm, explanation);
      }

    }
  }

  // no entry found in dictionary
  return msg;
};

module.exports = {
  name,

  before: (globals) => {
    // default location, in the source code
    let dictionaryLocation = "./nightwatch_dictionary.js";

    return new Promise((resolve, reject) => {

      if (argv.dictionary) {
        dictionaryLocation = path.resolve(process.cwd(), argv.dictionary);

      } else if (process.env.NIGHTWATCH_ERROR_DICTIONARY) {
        dictionaryLocation = path.resolve(process.cwd(), process.env.NIGHTWATCH_ERROR_DICTIONARY);

      }

      logger.log(`[${name}] Found dictionary at ${dictionaryLocation}, loading dictionary`);

      const shadowURL = url.parse(dictionaryLocation);

      if (!shadowURL.protocol) {
        // a file
        try {
          globals.dictionary = require(shadowURL.href);
          logger.debug(`[${name}] ${JSON.stringify(global.dictionary, null, 2)}`);
          return resolve();
        } catch (err) {

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
    client.dictionary = globals.dictionary;

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

            if (Boolean(assertion.failure)) {
              // only scan failure assertion
              assertion.fullMsg = _lookUpInDictionary(assertion.fullMsg, globals.dictionary);
              assertion.failure = _lookUpInDictionary(assertion.failure, globals.dictionary);
            }
            return assertion;
          });
        }
      });

      return resolve();
    });

  }
};