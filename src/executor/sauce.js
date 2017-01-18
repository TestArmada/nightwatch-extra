"use strict";

import https from "https";
import yargs from "yargs";
import Promise from "bluebird";
import settings from "../settings";

const verbose = yargs.argv.magellan_verbose;

export default {
  createMetaData: function () {
    return {
      resultURL: "http://saucelabs.com/tests/" + settings.sessionId,
      // Note: browserErrors has been deprecated, but we don't want to regress
      // versions of magellan that consume this property, so we pass it along.
      browserErrors: []
    };
  },

  summerize: function ({magellanBuildId, testResult, options}) {
    // TODO: add tag support: `"tags" : ["test","example"]`
    let data = JSON.stringify({
      "passed": testResult,
      // TODO: remove this
      "build": process.env.MAGELLAN_BUILD_ID,
      "public": "team"
    });

    if (verbose) {
      console.log("Data posting to SauceLabs job:");
      console.log(JSON.stringify(data));
    }

    let requestPath = "/rest/v1/" + options.username + "/jobs/" + settings.sessionId;

    return new Promise((resolve, reject) => {
      try {
        console.log("Updating saucelabs", requestPath);
        let req = https.request({
          hostname: "saucelabs.com",
          path: requestPath,
          method: "PUT",
          auth: options.username + ":" + options.accessKey,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length
          }
        }, (res) => {
          res.setEncoding("utf8");
          if (verbose) {
            console.log("Response: ", res.statusCode, JSON.stringify(res.headers));
          }
          res.on("data", (chunk) => {
            if (verbose) {
              console.log("BODY: " + chunk);
            }
          });
          res.on("end", () => {
            resolve();
          });
        });

        req.on("error", (e) => {
          console.log("problem with request: " + e.message);
        });
        req.write(data);
        req.end();
      } catch (err) {
        console.log("Error", err);
        resolve();
      }
    });

  }
};