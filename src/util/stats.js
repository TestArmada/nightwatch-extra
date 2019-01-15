import request from 'request';
import util from 'util';
import _ from 'lodash';

const host = process.env.MAGELLAN_COMMAND_DEBUG_INFLUXDB_URL;
const port = process.env.MAGELLAN_COMMAND_DEBUG_INFLUXDB_PORT || 8086;
const db = process.env.MAGELLAN_COMMAND_DEBUG_INFLUXDB_DB || "nwe";

const prefix = process.env.MAGELLAN_COMMAND_DEBUG_INFLUXDB_PREFIX || "demo";
let url = null;

if (host) {
  url = util.format("http://%s:%s/write?db=%s", host, port, db);
  console.log("Sending nightwatch-extra command debug info to influxdb server at: " + url);
}

/** event
  {
    "sessionId": "717cd3060bf5445e89515810b2345a60",
    "capabilities": {
        "extendedDebugging": true,
        "browserName": "chrome",
        "platform": "Windows 2012 R2",
        "version": "66",
        "timeout": 480000,
        "tunnel-identifier": "16df983d80ab3c",
        "name": "Demo Simple"
    },
    "type": "command",
    "cmd": "getel",
    "value": {
        "startTime": 1547581913707,
        "totalTime": 473,
        "seleniumCallTime": 0,
        "executeAsyncTime": 473
    }
  }
*/

export default function (event, sdclient = null, customizedOptions = null) {
  if (url && event.capabilities && _.includes(event.capabilities.name, prefix)) {
    const brw = event.capabilities.browserName + " " + event.capabilities.version + " " + event.capabilities.platform;

    const body = util.format("%s,session=%s,profile=%s,cmd=%s,name=%s %s=%s,%s=%s,%s=%s %s",
      "cmdMsmnt",
      event.sessionId,
      brw.split(" ").join("_"),
      event.cmd,
      event.capabilities.name.split(" ").join("_"),
      "totalTime", event.value.totalTime,
      "seleniumCmdTime", event.value.seleniumCallTime,
      "InjectScriptTime", event.value.executeAsyncTime,
      event.value.startTime + "000000" // to nano seconds
    );
    request.post({ url: url, body: body });
    // console.log(body)
  }
}