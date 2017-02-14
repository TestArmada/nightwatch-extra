

import https from "https";
import yargs from "yargs";
import Promise from "bluebird";
import settings from "../settings";
import logger from "../util/logger";

const verbose = yargs.argv.magellan_verbose;

export default {
  summerize({magellanBuildId, testResult, options}) {
    // TODO: add tag support: `"tags" : ["test","example"]`
    const data = JSON.stringify({
      "passed": testResult,
      // TODO: remove this
      "build": magellanBuildId,
      "public": "team"
    });

    if (verbose) {
      logger.log("Data posting to SauceLabs job:");
      logger.log(JSON.stringify(data));
    }

    const requestPath = `/rest/v1/${options.username}/jobs/${settings.sessionId}`;

    return new Promise((resolve) => {
      try {
        logger.log(`Updating saucelabs ${ requestPath}`);
        const req = https.request({
          hostname: "saucelabs.com",
          path: requestPath,
          method: "PUT",
          auth: `${options.username}:${options.accessKey}`,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length
          }
        }, (res) => {
          res.setEncoding("utf8");
          if (verbose) {
            logger.log(`Response: ${ res.statusCode }${JSON.stringify(res.headers)}`);
          }
          res.on("data", (chunk) => {
            if (verbose) {
              logger.log(`BODY: ${chunk}`);
            }
          });
          res.on("end", () => {
            resolve();
          });
        });

        req.on("error", (e) => {
          logger.err(`problem with request: ${e.message}`);
        });
        req.write(data);
        req.end();
      } catch (err) {
        logger.err(`Error${ err}`);
        resolve();
      }
    });

  }
};
