import fs from "fs";
import path from "path";
import yargs from "yargs";
import logger from "./util/logger";

const DEFAULT_MAX_TIMEOUT = 20000;
const JS_MAX_TIMEOUT_OFFSET = 5000;


const argv = yargs
  .alias("c", "config")
  .alias("v", "verbose")
  .argv;

const getConfig = function () {
  // Try a number of config locations, starting with an explicitly-overriden one, if it exists.
  const configLocations = [];

  // Configurable config location via arguments
  if (argv.config) {
    configLocations.push(path.resolve(argv.config.trim()));
  }

  // Classic config location / still used by some repos
  configLocations.push(path.resolve("./nightwatch.json"));

  // The magellan boilerplate's default config location
  configLocations.push(path.resolve("./conf/config.json"));

  // For unit test
  configLocations.push(path.resolve("./tests/conf/nightwatch.json"));

  const triedConfs = [];

  // Try a config location, if it fails, try another, and so on. If we run out of config locations
  // to try, we exit with an error and indicate all the locations we tried
  /*eslint consistent-return:0 */
  const nextConf = function () {
    const configPath = configLocations.shift();
    triedConfs.push(configPath);

    let data;
    try {
      data = fs.readFileSync(configPath, "utf8");
    } catch (e) {
      // Eat this exception because we handle the lack of data below
    }

    /* istanbul ignore if */
    if (!data) {
      if (configLocations.length === 0) {
        logger.err("nightwatch-extra has exhausted its "
          + "search for nightwatch configuration file.");
        logger.err("Tried configuration locations:");
        triedConfs.forEach((confLocation) => logger.err(`  ${confLocation}`));
        /*eslint no-process-exit:0 */
        process.exit(1);
      } else {
        return nextConf();
      }
    } else {
      logger.log(`Found nightwatch configuration at ${configPath}`);
      const nightwatchConfig = JSON.parse(data);
      return {
        nightwatchConfig
      };
    }
  };

  return nextConf();
};

const config = getConfig();

// Screenshot Output Control:
// Usage: --screenshots=path/to/temp/screenshot/directory
// This allows external test runners to set where screenshots from the
// screenshot() command will write their files.
const screenshotPath = argv.screenshot_path ?
  path.resolve(argv.screenshot_path) : path.resolve("./temp");

// Parameter for COMMAND_MAX_TIMEOUT
// This allows a config file to set it's own timeout value, will default to 60000
const timeoutValue = config.nightwatchConfig.test_settings.default.max_timeout
  || DEFAULT_MAX_TIMEOUT;
const jsTimeoutValue = timeoutValue - JS_MAX_TIMEOUT_OFFSET;

// Switch for asynchronous js injection
// This allows to run asynchronous js injection for a faster element
// detection/operation in some browsers
let syncModeBrowserList = ["iphone", "ipad"];
if (config.nightwatchConfig.test_settings.default.globals
  && Array.isArray(config.nightwatchConfig.test_settings.default.globals.syncModeBrowserList)) {
  // if browser in sync mode is defined in nightwatch.json
  syncModeBrowserList = config.nightwatchConfig.test_settings.default.globals.syncModeBrowserList;
}

const env = argv.env;

const FAILURE_REASONS = {
  BUILTIN_BAD_GATEWAY: "BAD_GATEWAY",
  BUILTIN_SELECTOR_NOT_FOUND: "SELECTOR_NOT_FOUND",
  BUILTIN_SELECTOR_NOT_VISIBLE: "SELECTOR_NOT_VISIBLE",
  BUILTIN_SELENIUM_ERROR: "SELENIUM_ERROR",
  BUILTIN_ATTRIBUTE_NOT_FOUND: "ATTRIBUTE_NOT_FOUND",
  BUILTIN_ELEMENT_NOT_OPERABLE: "ELEMENT_NOT_OPERABLE",
  BUILTIN_COMMAND_TIMEOUT: "COMMAND_TIMEOUT",
  BUILTIN_ACTUAL_NOT_MEET_EXPECTED: "ACTUAL_NOT_MEET_EXPECTED"
};

export default {
  WAIT_INTERVAL: 100,
  JS_WAIT_INTERNAL: 100,
  MOBILE_SEEN_MAX: 1,
  SEEN_MAX: 3,
  JS_SEEN_MAX: 3,
  COMMAND_MAX_TIMEOUT: timeoutValue,
  JS_MAX_TIMEOUT: jsTimeoutValue,

  // true if test is launched by a specific runner other than nightwatch, such as magellan
  isWorker: !!argv.worker,
  env,
  verbose: argv.verbose,

  sessionId: undefined,

  nightwatchConfig: config.nightwatchConfig,

  screenshotPath,
  syncModeBrowserList,

  FAILURE_REASONS
};
