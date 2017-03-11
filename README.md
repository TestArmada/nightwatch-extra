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

Nightwatch-Extra@4 integrates `appium`, which means you can now use nightwatchjs to test in appium either locally or with a test environment provider, such as saucelabs, for mobile web or app test.

 1. Launch appium server automatically when tests need it
 2. Provide mobile commands for app test with appium
 3. Provide mobile assertions for app teset with appium
 4. Provide a base-mobile-base-command for easy extension
 5. Provide a base-mobile-base-assertion for easy extension

### What to update in my repo

#### Configuration change

Make sure your `nightwatch.json` file has the following changes
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

#### Code change

 1. baseTest.before

 We've added a callback in `before`. If you have a customized base test, please make sure you have the callback called in your customized `baseTest.before`. 
 
 Please refer to [Here](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/lib/example-base-test-class.js#L23) as example.

 2. baseTest.after
 
 `after` needs to be called at the very first step in your customized `baseTest.after` if you have one. 
 
 Please refer to [Here](https://github.com/TestArmada/boilerplate-nightwatch/blob/master/lib/example-base-test-class.js#L42) as example.
