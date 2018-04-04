# Nightwatch-Extra guide for iOS app test

## Pre-requisites

 1. install appium (follow steps from [here](https://github.com/appium/appium))
 2. install xcode and correct iOS simulator versions for your test.

## How to usage

### 1. Create test entry in `nightwatch.json`

#### For mweb test
In order to run test in appium locally, you can start with adding following code block into `nightwatch.json`

```javascript
"appiummweb": {
    "desiredCapabilities": {
        "browserName": "safari",
        "appiumVersion": "1.6.3",
        "automationName": "xcuitest",
        "platformName": "iOS",
        "platformVersion": "9.3",
        "deviceName": "iPhone 6",
        "waitForAppScript": "true"
    },
    "selenium": {
        "start_process": false
    },
    "appium": {
        "start_process": true
    }
}
```

Notice that 
 1. `appiumVersion` has to match the appium version you installed
 2. `platformVersion` has to match the iOS simulator version you installed
 3. `deviceName` has to match the iOS simulator type you installed

#### For native app test
You can also use the following block as template if you want to run an iOS native app test
```javascript
"appiumapp": {
    "skip_testcases_on_fail": true,
    "desiredCapabilities": {
        "app": "${PATH_TO_YOUR_LOCAL_.APP_APP}",
        "appiumVersion": "1.6.3",
        "automationName": "xcuitest",
        "platformName": "iOS",
        "platformVersion": "9.3",
        "deviceName": "iPhone 6",
        "sendKeyStrategy": "setValue",
        "waitForAppScript": "true"
    },
    "selenium": {
        "start_process": false
    },
    "appium": {
        "start_process": true,
        "fullReset": true
    }
}
```

Notice that
 1. `platformVersion` has to match the iOS simulator version you installed
 2. `deviceName` has to match the iOS simulator type you installed
 3. in `appium` entry, you can add any parameter that appium supports to launch appium server in camel case, such as `fullReset` will map to `--full-reset`.

### 2. Config test entry

The allowed configuration for `desiredCapabilities` can be found [here](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/running-tests.md).

If `appium.start_process` is configured and is true, `nightwatch-extra` will launch appium automatically at `http://${selenium_host}:${selenium_port}`. 

NOTE: appium is also a selenium server. So `selenium.start_process` and `appium.start_process` are mutually exclusive, meaning that you can only enable one at a time.

### 3. Enable appium automatic start/stop functionality

Appium automatic start/stop is enabled via `nightwatch`'s [external globals](http://nightwatchjs.org/guide#external-globals). You can follow the steps to enable them.
 
 1. create a `global.js` and put it in your `nightwatch.json` like 

 ```javascript
 {
   ...
   "globals_path": "globals.js",
   ...
 }
 ```
 2. in `global.js`, add following code. If you already have a `global.js`, simply put `startAppium` and `stopAppium` in corresponding places.
 
 ```javascript
 const startAppium = require("testarmada-nightwatch-extra/lib/appium/start");
 const stopAppium = require("testarmada-nightwatch-extra/lib/appium/stop");

 module.exports = {
   before: function (callback) {
     startAppium(this, this.test_settings, callback);
   },

   after: function (callback) {
     stopAppium(this, callback);
   }
 };
 ```

Notice that appium automatical start/stop functions are only enabled if `appium.start_process` is set to true.

## Command vocabulary

The mobile command/assertion set follows the same convention of their desktop counterparts (see [here](web.md)). But we don't recommend applying nightwatch command/assertion directly in your app test because nightwatch doesn't support `accessibility id`. To use `accessibility id` as your element identifier we recommend to implement your own command/assertion in the same way as the included mobile command/assertion in `nightwatch-extra`.

### Mobile command list

<table>
  <tr>
    <th>Nightwatch-extra Command</th>
    <th>Example</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>clickMobileEl(using, selector, callback)</td>
    <td>clickMobileEl("accessibility id", "mybutton")</td>
    <td>click a button with given selector</td>
  </tr>
  <tr>
    <td>getMobileEl(using, selector, callback)</td>
    <td>getMobileEl('xpath', '//UIAButton[@name = "Add"]')</td>
    <td>return an element with given selector in the callback if it exists</td>
  </tr>
  <tr>
    <td>setMobileElValue(using, selector, valueToSet, callback)</td>
    <td>setMobileElValue("accessibility id", "search", "cereal")</td>
    <td>set element's value to given value with given selector</td>
  </tr>
  <tr>
    <td>getMobileElValue(using, selector, callback)</td>
    <td>setMobileElValue("accessibility id", "search")</td>
    <td>return element's value in the callback with given selector</td>
  </tr>
  <tr>
    <td>swipeMobileElTo(using, selector, x, y, callback)</td>
    <td>swipeMobileElTo("accessibility id", "search", 0, -100)</td>
    <td>swipe screen starting from an element with given selector to point measured by vector (x, y)</td>
  </tr>
  <tr>
    <td>swipeMobileElToEl(using, selector, using2, selector2, callback)</td>
    <td>swipeMobileElToEl("accessibility id", "answer", "accessibility id", "question")</td>
    <td>swipe screen starting from an element with given selector to another element with given selector</td>
  </tr>
  <tr>
    <td>swipeScreenTo(fx, fy, tx, ty, callback)</td>
    <td>swipeScreenTo(30, 400, 0, -100)</td>
    <td>swipe screen starting from given coordinate (fx,fy) to point measured by vector (x, y)</td>
  </tr>
  <tr>
    <td>DEPRECATED: waitForMobileElNotPresent(using, selector)</td>
    <td>waitForMobileElNotPresent("accessibility id", "search")</td>
    <td>wait for an element with given selector to be disappear</td>
  </tr>
</table>

### Mobile assertion list

<table>
  <tr>
    <th>Nightwatch-extra Assertion</th>
    <th>Example</th>
    <th>Nightwatch Equivalent</th>
  </tr>
  <tr>
    <td>mobileElAttrContains(using, selector, attribute, expected)</td>
    <td>mobileElAttrContains("accessibility id", "submit", "label", "Add a Card")</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
</table>