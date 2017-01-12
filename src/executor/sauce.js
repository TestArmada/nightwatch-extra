"use strict";

import https from "https";
import yargs from "yargs";
import settings from "../settings";

const verbose = yargs.argv.magellan_verbose;

export default class SauceExecutor {
  constructor({magellanBuildId, nightwatch}) {
    this.buildId = magellanBuildId;
    this.nightwatch = nightwatch;
  }

  getTestUrl() {
    return "http://saucelabs.com/tests/" + this.nightwatch.sessionId;
  }

  
};