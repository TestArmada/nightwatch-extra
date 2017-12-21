import logger from "../util/logger";
import { argv } from "yargs";
import request from "request";
import _ from "lodash";
import path from "path";
import url from "url";

const name = "Error Dictionary Plugin";


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

  /* eslint-disable global-require,no-magic-numbers*/
  before: (globals) => {
    // default location, in the source code
    let dictionaryLocation = "./nightwatch_dictionary.js";
    const builtinDictionary = require(dictionaryLocation);

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
          // merge builtin dictionary with customized dictionary
          globals.dictionary = _.assign({}, builtinDictionary, require(shadowURL.href));
          logger.debug(`[${name}] ${JSON.stringify(global.dictionary, null, 2)}`);
          return resolve();
        } catch (err) {

          logger.err(`[${name}] Error in getting dictionary from ${shadowURL.href}, ${err}`);
          return reject(err);
        }

      } else {
        return request.get(shadowURL.href, (err, response, body) => {

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

  /* eslint-disbale no-unused-vars */
  beforeEach(globals, client) {
    client.dictionary = globals.dictionary;

    // const funcs = _.functions(client);

    return new Promise((resolve) => {

      // _.forEach(funcs, (func) => {
      //   const originalFunc = client[func];

      //   client[func] = function adaptorFn() {
      //     // simple adaptor
      //     const args = Array.prototype.slice.call(arguments);

      //     return originalFunc.apply(client[func], args);
      //   };
      // });

      return resolve();

    });
  },

  afterEach(globals, client) {

    return new Promise((resolve) => {

      _.forEach(client.currentTest.results.testcases, (testcase) => {

        if (testcase.assertions.length > 0) {
          testcase.assertions = _.map(testcase.assertions, (assertion) => {

            if (assertion.failure) {
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
