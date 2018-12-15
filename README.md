# Nightwatch-Extra

[![Build Status](https://api.travis-ci.org/TestArmada/nightwatch-extra.svg?branch=master)](https://travis-ci.org/TestArmada/nightwatch-extra)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/TestArmada/nightwatch-extra/branch/master/graph/badge.svg)](https://codecov.io/gh/TestArmada/nightwatch-extra)
[![Downloads](http://img.shields.io/npm/dm/testarmada-nightwatch-extra.svg?style=flat)](https://npmjs.org/package/testarmada-nightwatch-extra)

Enhanced [nightwatchjs](http://nightwatchjs.org/) commands and assertions for test automation for desktop web, mobile web, native app and hybrid app. 

## Features

### nightwatch enhancement
 1. A appium integrated base test for customization.

### nightwatch enhancement for desktop web test
 1. An automatic wait for element to be visible (using `:visible` pseudo) before executing every nightwatch command or assertion (done by injecting sizzlejs).
 2. A base command with wait-for-visible feature for further extension.
 3. A base assertion with wait-for-visible feature for further extension.
 4. An easy-to-use [sizzlejs](http://sizzlejs.com/) selector option.
 5. Sets of enhanced commands and assertions

### nightwatch extension for mobile web native app test
 1. Option to launch appium programmatically in base test for easy debugging and test integration.
 2. A base command for native app test with wait-for-visible feature for further extension.
 3. A base assertion for native app test with wait-for-visible feature for further extension.
 4. Sets of enhanced commands and assertions for native app test.

### ./bin/owl
./bin/owl can generate nightwatch compatible [wd](https://github.com/admc/wd) commands for you so that you can use nightwatch runner to run test written in wd format. All nightwatch compatible wd commands follow the same nightwatch standard and can be chained as plain nightwatch commands.

All wd commands will be transformed into nightwatch custom command files with name `wd${command}.js` and capitalized first letter in wd command name in the given folder. For example wd command `element` will be transformed into file `wdElement.js`, and `clickElement` will be transformed into `wdClickElement.js`.

The command parameters will stay the same. 

```js
// wd command
.element('accessibility id', 'signin', (el) => console.log(el));

// nightwatch command
.wdElement('accessibility id', 'signin', (el) => console.log(el));
```

## Usage

In `nightwatch.json` add following content

```
  "custom_assertions_path": [
    "./node_modules/testarmada-nightwatch-extra/lib/assertions",
    "./node_modules/testarmada-nightwatch-extra/lib/assertions/mobile"
  ],
  "custom_commands_path": [
    "./node_modules/testarmada-nightwatch-extra/lib/commands",
    "./node_modules/testarmada-nightwatch-extra/lib/commands/mobile"
  ]
```

If you're using this repo together with [testarmada-magellan](http://github.com/TestArmada/magellan), your base test can inherit from the base test by 
```
var BaseTest = require("testarmada-nightwatch-extra/lib/base-test-class");
```

For full example, please checkout [boilerplate-nightwatch](https://github.com/TestArmada/boilerplate-nightwatch)


### Web test 

For desktop and mobile web test, please refer to [this page](docs/web.md).

### iOS app test

For iOS app test, please refer to [this page](docs/ios.md).

### ./bin/owl
After `npm install` ./bin/owl can be found under `./node_modules/.bin/owl`. To use ./bin/owl latet [wd](https://github.com/admc/wd) is required. Please do `npm install wd --save` in your repo firstly.

To create wd commands under ./lib/custom_command
```
./bin/owl --output ./lib/custom_command --config ${path to nightwatch.json}
```

## *Important migration notice*

If you're migrating from [magellan-nightwatch](http://github.com/TestArmada/magellan-nightwatch) to [nightwatch-extra](http://github.com/TestArmada/nightwatch-extra), please follow the steps

1. Delete `./node_modules/testarmada-magellan-nightwatch` from your project.
2. In `package.json` 
```javascript
dependencies:{
    "testarmada-magellan-nightwatch: "${VERSION}",   // DELETE THIS LINE
    "testarmada-nightwatch-extra: "^3.0.0"           // ADD THIS LINE
}
```
3. Run `npm install` again under your project root folder.
4. Make sure your `nightwatch.json` file has the following changes
```javascript
"custom_commands_path":[
    "./node_modules/testarmada-magellan-nightwatch/lib/commands"  // DELETE THIS LINE
    "./node_modules/testarmada-nightwatch-extra/lib/commands"     // ADD THIS LINE
],
"custom_assertions_path":[
    "./node_modules/testarmada-magellan-nightwatch/lib/assertions"  // DELETE THIS LINE
    "./node_modules/testarmada-nightwatch-extra/lib/assertions"     // ADD THIS LINE
]

```
5. Change parent of your base test class (if there is)
```javascript
require("testarmada-magellan-nightwatch/lib/base-test-class"); // DELETE THIS LINE
require("testarmada-nightwatch-extra/lib/base-test-class");    // ADD THIS LINE
```

## *Important migration notice for Nightwatch-Extra@5*

### What is changed in Nightwatch-Extra@5

`Nightwatch-Extra@5` allows user to define plugins. A plugin can be used for test failure detection, error sum up or anything you can do in nightwatchjs' globals.js. With this plugin architecture, following features are designed as plugins in `nightwatch-extra#5`
 
 1. Appium server life cycle management
 2. Error dictionary

### What to update in my repo

No change is required if you're not willing to add customized plugin. In `nightwatch-extra@5` the above features are already placed as plugins and enabled by default.

If you want to implement your own plugin and enable it

 1. In `nightwatch.json` file, add plugins entry under `test_settings -> default`. Plugins can be node module or a js file
 ```js
 "plugins": []
 ```
 2. In `nightwatch.json` file, enable `globals_path`
 ```js
 "globals_path": "./lib/globals.js"
 ```
 3. In `./lib/globals.js`, add following content
 ```js
  const extraGlobals = require("testarmada-nightwatch-extra/lib/globals");

  module.exports = {
    before: function (callback) {
      extraGlobals.before.apply(this, [callback]);
    },

    after: function (callback) {
      extraGlobals.after.apply(this, [callback]);
    },

    beforeEach: function (browser, callback) {
      extraGlobals.beforeEach.apply(this, [browser, callback]);
    },

    afterEach: function (browser, callback) {
      extraGlobals.afterEach.apply(this, [browser, callback]);
    }
  };

 ```

## *Important migration notice for Nightwatch-Extra@4*

### What is changed in Nightwatch-Extra@4

`Nightwatch-Extra@4` makes `appium` an option besides `selenium-server`, which means you can now use nightwatchjs to test in appium either locally or with a test environment provider, such as saucelabs, for mobile web or app test.

 1. Launch appium server automatically when tests need it
 2. Provide mobile commands for app test with appium
 3. Provide mobile assertions for app teset with appium
 4. Provide a base-mobile-base-command for easy extension
 5. Provide a base-mobile-base-assertion for easy extension

### What to update in my repo

#### Configuration change

 1. Make sure your `nightwatch.json` file has the following changes
  ```javascript
  "custom_commands_path":[
      "./node_modules/testarmada-nightwatch-extra/lib/commands",
      "./node_modules/testarmada-nightwatch-extra/lib/commands/mobile"
  ],
  "custom_assertions_path":[
      "./node_modules/testarmada-nightwatch-extra/lib/assertions",
      "./node_modules/testarmada-nightwatch-extra/lib/assertions/mobile"
  ]
  ```
 2. Add following code to your environment entry in `nightwatch.json`
 ```javascript
 "selenium": {
   "start_process": false
 },
 "appium": {
   "start_process": true
 }
 ```
 
 Full example [nightwatch.json](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/conf/nightwatch.json#L77)

#### Code change

 1. baseTest.before

 We've added a callback in `before`. If you have a customized base test, please make sure you have the callback called in your customized `baseTest.before`. 
 
 Please refer to [Here](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/lib/example-base-test-class.js#L23) as example.

 2. baseTest.after
 
 `after` needs to be called at the very first step in your customized `baseTest.after` if you have one. 
 
 Please refer to [Here](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/lib/example-base-test-class.js#L42) as example.

 3. globals.js
 
 To automatically handle appium server, a `globals.js` is required to start appium in nightwatchjs's global before and stop appium in global after. 
 
 Please refer to the changes in [nightwatch.json](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/conf/nightwatch.json#L18) and [globals.js](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/lib/globals.js) for more info.




## Error Dictionary
Starting with version 4.3.1, we allow error messages from Nightwatch Extra API calls to be mapped to a dictionary file to provide the user with a better explanation for some of the errors that are encounted. Some of the standard messages now include codes (listed below) to be mapped, but you can also map other parts of the error message or even error messages from Saucelabs or Selenium.
  * [SELECTOR_NOT_VISIBLE] - indicates that the selector was found but is not visible.
  * [BAD_GATEWAY] - indicates that the Saucelabs browser cannot connect to the given url. Only works for Saucelabs browsers.
  * [SELECTOR_NOT_FOUND] - indicates that the selector was not found.
  * [SELENIUM_ERROR] - indicates a Saucelabs or local Selenium error.
  * [ATTRIBUTE_NOT_FOUND] - For mobile calls, it indicates that the given attribute was not found.
 
The error dicationary needs to be a json formatted file with name-value pairs. It can be passed in as a system environment variable NIGHTWATCH_ERROR_DICTIONARY or in nightwatch.json attribute test_settings.default.errorDictionary. It can be a file path, url, or a url object accepted by [request.js](https://github.com/request/request). System environment variable NIGHTWATCH_ERROR_DICTIONARY takes precendence over attribute in nightwatch.json. So if System environment variable NIGHTWATCH_ERROR_DICTIONARY exists, it will use that value.

Examples:
```
// file
export NIGHTWATCH_ERROR_DICTIONARY=/app/nightwatch-error-dictionary.json

// url
export NIGHTWATCH_ERROR_DICTIONARY=http://www.foo.com/nightwatch-error-dictionary.json
```

Example dictionary.json:
```
{
  "BAD_GATEWAY": "Error connecting to server. Server may not have started propertly or there may be a problem with the network.",
  "SELECTOR_NOT_FOUND": "Element matching the selector could not be found.",
  "SELECTOR_NOT_VISIBLE": "Element matching the selector was found but is not visible.",
  "SELENIUM_ERROR": "An unexpected error occured in Selenium.",
  "ATTRIBUTE_NOT_FOUND": "Element with attribute name could not be found."
}
```

## License
Documentation in this project is licensed under Creative Commons Attribution 4.0 International License. Full details available at https://creativecommons.org/licenses/by/4.0
