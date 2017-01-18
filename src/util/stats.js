"use strict";

import util from "util";
import _ from "lodash";
import SDC from "statsd-client";

// second check for magellan compatibility
const ISENABLED = process.env.MAGELLAN_STATSD ? true : false;
const HOST = process.env.MAGELLANSTATS_STATSD_URL;
const PORT = process.env.MAGELLANSTATS_STATSD_PORT;
const PREFIX = process.env.MAGELLANSTATS_STATSD_PREFIX + ".";
const JOBNAME = process.env.MAGELLAN_JOB_NAME;


export default function (event, sdclient = null, customized_options = null) {
  /**
   *  event: { 
            "capabilities": {
                id: 'chrome_latest_Windows_10_Desktop',
                browserName: 'chrome',
                version: '50',
                platform: 'Windows 10',
                'tunnel-identifier': 'some-tunnel-value',
                name: 'Google'
            }
            "type"" "command"
            "cmd": "clickEl", 
            "value": {
              totalTime: 300,
              seleniumCallTime: 180,
              executeAsyncTime: 120
            } 
        }
   */
  let isEnabled = customized_options ? customized_options.isEnabled : ISENABLED;
  let host = customized_options ? customized_options.host : HOST;
  let port = customized_options ? customized_options.port : PORT;
  let prefix = customized_options ? customized_options.prefix : PREFIX;
  let jobName = customized_options ? customized_options.jobName : JOBNAME;

  if (!isEnabled || !host || !port) {
    return;
  }

  let fullEventKey = util.format(
    "%s%s.%s.%s.%s.%s",
    prefix,
    event.capabilities.id || event.capabilities.browserName,
    event.capabilities["tunnel-identifier"] ? "tunnel" : "notunnel",
    jobName,
    event.type,
    event.cmd
  );

  let client = sdclient ? sdclient : new SDC({ host: host, port: port, prefix: prefix });

  client.timing(fullEventKey + ".totalTime", event.value.totalTime);
  client.timing(fullEventKey + ".seleniumCallTime", event.value.seleniumCallTime);
  client.timing(fullEventKey + ".executeAsyncTime", event.value.executeAsyncTime);
};