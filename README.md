# Nightwatch-Extra

[![Build Status](https://api.travis-ci.org/TestArmada/nightwatch-extra.svg?branch=master)](https://travis-ci.org/TestArmada/nightwatch-extra)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/TestArmada/nightwatch-extra/branch/master/graph/badge.svg)](https://codecov.io/gh/TestArmada/nightwatch-extra)

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
