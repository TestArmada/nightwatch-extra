var util = require("util");

var _ = require("lodash");
var SDC = require("statsd-client");

// second check for magellan compatibility
var ISENABLED = process.env.MAGELLAN_STATSD ? true : false;
var HOST = process.env.MAGELLANSTATS_STATSD_URL;
var PORT = process.env.MAGELLANSTATS_STATSD_PORT;
var PREFIX = process.env.MAGELLANSTATS_STATSD_PREFIX + ".";
var JOBNAME = process.env.MAGELLAN_JOB_NAME;


module.exports = function statd(event, sdclient, customized_options) {
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

  var isEnabled = customized_options ? customized_options.isEnabled : ISENABLED;
  var host = customized_options ? customized_options.host : HOST;
  var port = customized_options ? customized_options.port : PORT;
  var prefix = customized_options ? customized_options.prefix : PREFIX;
  var jobName = customized_options ? customized_options.jobName : JOBNAME;

  if (!isEnabled || !host || !port) {
    return;
  }

  var fullEventKey = util.format(
    "%s%s.%s.%s.%s.%s",
    prefix,
    event.capabilities.id || event.capabilities.browserName,
    event.capabilities["tunnel-identifier"] ? "tunnel" : "notunnel",
    jobName,
    event.type,
    event.cmd
  );

  var client = sdclient ? sdclient : new SDC({ host: host, port: port, prefix: prefix });

  client.timing(fullEventKey + ".totalTime", event.value.totalTime);
  client.timing(fullEventKey + ".seleniumCallTime", event.value.seleniumCallTime);
  client.timing(fullEventKey + ".executeAsyncTime", event.value.executeAsyncTime);
};
