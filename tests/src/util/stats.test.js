"use strict";

import Promise from "bluebird";
import chai from "chai";
import _ from "lodash";

import stats from "../../../lib/util/stats";

const expect = chai.expect;
const assert = chai.assert;

describe("Stats", () => {

  let event = {
    capabilities: {
      id: 'chrome_latest_Windows_10_Desktop',
      browserName: 'chrome',
      version: '50',
      platform: 'Windows 10',
      'tunnel-identifier': 'some-tunnel-value',
      name: 'Google'
    },
    type: "command",
    cmd: "clickEl",
    value: {
      totalTime: 300,
      seleniumCallTime: 180,
      executeAsyncTime: 120
    }
  };

  let SDClient = class {
    constructor({ host, port, prefix}) {

    }
    timing(key, value) { }
  };

  let customized_options = {
    isEnabled: true,
    host: "fake_host",
    port: "123",
    prefix: "ne",
    jobName: "fake_jobname"
  };

  let sdclient = new SDClient({
    host: customized_options.host,
    port: customized_options.port,
    prefix: customized_options.prefix
  });

  it("Succeed", () => {
    stats(event, sdclient, customized_options);
  });

  it("Disabled", () => {
    let k = _.cloneDeep(customized_options);
    k.isEnabled = false;

    stats(event, sdclient, customized_options);
  });
});