"use strict";

import https from "https";
import yargs from "yargs";
import Promise from "bluebird";
import settings from "../settings";

const verbose = yargs.argv.magellan_verbose;

export default {
  createMetaData: function () {
    return {
      // Note: browserErrors has been deprecated, but we don't want to regress
      // versions of magellan that consume this property, so we pass it along.
      browserErrors: []
    };
  },
  summerize: function ({magellanBuildId}) {
    return Promise.resolve();
  }
};