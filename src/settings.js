"use strict";

import fs from "fs";
import path from "path";
import yargs from "yargs";

const DEFAULT_MAX_TIMEOUT = 60000;
const JS_MAX_TIMEOUT_OFFSET = 5000;


let argv = yargs
  .alias("c", "config")
  .alias("v", "verbose")
  .argv;
console.log(argv)
function getConfig() {
  // Try a number of config locations, starting with an explicitly-overriden one, if it exists.
  let configLocations = [];

  // Configurable config location via arguments
  if (argv.config) {
    configLocations.push(path.resolve(argv.config.trim()));
  }

  // Classic config location / still used by some repos
  configLocations.push(path.resolve("./nightwatch.json"));

  // The magellan boilerplate's default config location
  configLocations.push(path.resolve("./conf/config.json"));

  let triedConfs = [];

  // Try a config location, if it fails, try another, and so on. If we run out of config locations
  // to try, we exit with an error and indicate all the locations we tried
  let nextConf = function () {
    let configPath = configLocations.shift();
    triedConfs.push(configPath);

    let data;
    try {
      data = fs.readFileSync(configPath, "utf8");
    } catch (e) {
      // Eat this exception because we handle the lack of data below
    }

    if (!data) {
      if (configLocations.length === 0) {
        console.error("nightwatch-magellan has exhausted its search for nightwatch configuration file.");
        console.error("Tried configuration locations:");
        triedConfs.forEach((confLocation) => console.error("  " + confLocation));
        process.exit(1);
      } else {
        return nextConf();
      }
    } else {
      console.log("nightwatch-magellan has found nightwatch configuration at ", configPath);
      let nightwatchConfig = JSON.parse(data);
      return {
        nightwatchConfig: nightwatchConfig
      };
    }
  };

  return nextConf();
};

let config = getConfig();

// Screenshot Output Control:
// Usage: --screenshots=path/to/temp/screenshot/directory
// This allows external test runners to set where screenshots from the 
// screenshot() command will write their files.
let screenshotPath = !!argv.screenshot_path ?
  path.resolve(argv.screenshot_path) : path.resolve("./temp");

// Parameter for COMMAND_MAX_TIMEOUT
// This allows a config file to set it's own timeout value, will default to 60000
let timeoutValue = config.nightwatchConfig.test_settings.default.max_timeout
  || DEFAULT_MAX_TIMEOUT;
let jsTimeoutValue = timeoutValue - JS_MAX_TIMEOUT_OFFSET;

// Switch for asynchronous js injection
// This allows to run asynchronous js injection for a faster element 
// detection/operation in some browsers
let syncModeBrowserList = ["iphone", "ipad"];
if (config.nightwatchConfig.test_settings.default.globals
  && Array.isArray(config.nightwatchConfig.test_settings.default.globals.syncModeBrowserList)) {
  // if browser in sync mode is defined in nightwatch.json
  syncModeBrowserList = config.nightwatchConfig.test_settings.default.globals.syncModeBrowserList;
}

let env = argv.env;

export default {
  WAIT_INTERVAL: 100,
  JS_WAIT_INTERNAL: 100,
  SEEN_MAX: 3,
  JS_SEEN_MAX: 3,
  COMMAND_MAX_TIMEOUT: timeoutValue,
  JS_MAX_TIMEOUT: jsTimeoutValue,

  // true if test is launched by a specific runner other than nightwatch, such as magellan
  isWorker: !!argv.worker,
  env: env,
  verbose: argv.verbose,

  sessionId: undefined,

  nightwatchConfig: config.nightwatchConfig,

  screenshotPath: screenshotPath,
  syncModeBrowserList: syncModeBrowserList
};