import util from "util";
import SDC from "statsd-client";

// second check for magellan compatibility
const ISENABLED = process.env.MAGELLAN_STATSD ? true : false;
const HOST = process.env.MAGELLANSTATS_STATSD_URL;
const PORT = process.env.MAGELLANSTATS_STATSD_PORT;
const PREFIX = `${process.env.MAGELLANSTATS_STATSD_PREFIX }.`;
const JOBNAME = process.env.MAGELLAN_JOB_NAME;

/*eslint complexity: ["error", 12]*/
export default function (event, sdclient = null, customizedOptions = null) {
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

  const isEnabled = customizedOptions ? customizedOptions.isEnabled : ISENABLED;
  const host = customizedOptions ? customizedOptions.host : HOST;
  const port = customizedOptions ? customizedOptions.port : PORT;
  const prefix = customizedOptions ? customizedOptions.prefix : PREFIX;
  const jobName = customizedOptions ? customizedOptions.jobName : JOBNAME;

  if (!isEnabled || !host || !port) {
    return;
  }

  const fullEventKey = util.format(
    "%s%s.%s.%s.%s.%s",
    prefix,
    event.capabilities.id || event.capabilities.browserName,
    event.capabilities["tunnel-identifier"] ? "tunnel" : "notunnel",
    jobName,
    event.type,
    event.cmd
  );

  const client = sdclient ? sdclient : new SDC({ host, port, prefix });

  client.timing(`${fullEventKey }.totalTime`, event.value.totalTime);
  client.timing(`${fullEventKey }.seleniumCallTime`, event.value.seleniumCallTime);
  client.timing(`${fullEventKey }.executeAsyncTime`, event.value.executeAsyncTime);
}
