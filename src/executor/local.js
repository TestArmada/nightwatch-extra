"use strict";

import https from "https";
import yargs from "yargs";
import Promise from "bluebird";
import settings from "../settings";

const verbose = yargs.argv.magellan_verbose;

export default class LocalExecutor {
  constructor({magellanBuildId}) {
    this.buildId = magellanBuildId;
  }

  finish() {
    return Promise.resolve();
  }
};