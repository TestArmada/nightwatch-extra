# Nightwatch-Extra guide for iOS app test

## Pre-requisites

 1. install Android Studio (follow steps from [here](https://developer.android.com/studio/index.html)).
 2. setup AVD and create the emulator will be used for testing.
 3. make sure emulator in use has the latest chrome browser. if now, follow [here](https://eveningsamurai.wordpress.com/2014/05/16/mobile-web-automation-with-appium/) to install latest chrome apk 

 ## Usage

 ### 1. Create test entry in `nightwatch.json`

 In order to run test in appium locally, you can start with adding following code block into `nightwatch.json`

```javascript
"appiumandroidmweb": {
    "desiredCapabilities": {
        "browserName": "Chrome",
        "appiumVersion": "1.6.3",
        "platformName": "Android",
        "platformVersion": "7.0",
        "deviceName": "Pixel_API_24",
        "avd": "Pixel_API_24",
        "avdArgs": "-netfast -noaudio -no-boot-anim"
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
 2. `platformVersion` has to match the emulator version you installed
 3. `avd` has to match the AVD name you created
 4. `avdArgs` is optional

 **PLEASE NOTE**: 
 1. If `avd` is present, `appium` will launch emulator automatically. However there might be a chance that `appium` will time out before the emulator is launched which will fail your test. We recommend you to launch the emulator before your test run first.

 ### 2. Config test entry

The allowed configuration for `desiredCapabilities` can be found [here](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/running-tests.md).

if `appium.start_process` is configured and is true, `nightwatch-extra` will launch appium automatically at `http://${selenium_host}:${selenium_port}`. 

NOTE: appium is also a selenium server. so `selenium.start_process` and `appium.start_process` are mutually exclusive, meaning that you can only enable one at a time.