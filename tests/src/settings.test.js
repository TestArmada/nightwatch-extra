import chai from "chai";
import yargs from "yargs";

import settings, { buildSettings } from "../../lib/settings";

const expect = chai.expect;

describe("Settings", () => {
  it("Loads defaults using command line arguments", () => {
    // Reset the sessionId, as it gets modified during usage (i.e. other tests)
    settings.sessionId = undefined;
    expect(settings).to.deep.equal(buildSettings(yargs.argv));
  });

  it("Loads from a .js file", () => {
    const argv = JSON.parse(JSON.stringify(yargs.argv));
    argv.config = "./tests/conf/nightwatch.js";
    argv.c = "./tests/conf/nightwatch.js";
    const settingsFromJsFile = buildSettings(argv);
    console.log(JSON.stringify(settingsFromJsFile));
    expect(settingsFromJsFile.nightwatchConfig.fromJs).to.be.true;
  });
});