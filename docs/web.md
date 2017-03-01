# Nightwatch-Extra guide for web test (desktop web and mobile web)

## Usage

### Define synchronous mode browser list

`testarmada-nightwatch-extra` can inject async js for a faster element detection. However this feature isn't supported by all browsers (especially those latest ones that still don't fully support selenium protocol). 

To disable the async injection feature explicitly, add following `syncModeBrowserList` into `globals` of `nightwatch.json`

```
"globals": {
  "syncModeBrowserList": [
    "safari:10",
    "ipad
  ]
}Ï
```

Syntax of each item in the list

 1. browser:version. example: safari:10 will tell `nightwatch-extra` to run in sync mode for safari@10
 2. browser. exmaple: chrome will tell `nightwatch-extra` to run in sync mode for all versio of chrome


## Command vocabulary

If you're familiar with `nightwatch` or are looking to translate `nightwatch` examples into `nightwatch-extra`, refer to the tables below for equivalent enhanced (i.e. more reliable) versions of `nightwatch` commands and assertions.
All commands and assertions are fully compatible with nightwatchjs page object.

### Enhanced command list

<table>
  <tr>
    <th>Nightwatch-extra Command</th>
    <th>Example</th>
    <th>Nightwatch Equivalent</th>
  </tr>
  <tr>
    <td>clickAutomationEl(css selector)</td>
    <td>clickAutomationEl("mybutton")</td>
    <td>click("[data-automation-id='mybutton']")</td>
  </tr>
  <tr>
    <td>clickEl(css selector)</td>
    <td>clickEl(".submitButton")</td>
    <td>click(".submitButton")</td>
  </tr>
  <tr>
    <td>getEl(css selector)</td>
    <td>getEl(".submitButton")</td>
    <td>waitForElementPresent(".submitButton") or waitForElementVisible(".submitButton")</td>
  </tr>
  <tr>
    <td>moveToEl(css selector, xoffset, yoffset)</td>
    <td>moveToEl(".submitButton", 10, 10)</td>
    <td>moveToElement(".submitButton", 10, 10)</td>
  </tr>
  <tr>
    <td>setElValue(css selector, value)</td>
    <td>setElValue(".username", "testarmada")</td>
    <td>setValue(".username", "testarmada")</td>
  </tr>
  <tr>
    <td>getElValue(css selector, callback)</td>
    <td>getElValue(".user-profile", function(profile){// use profile here})</td>
    <td>getValue(".user-profile", function(profile){// use profile here})</td>
  </tr>
  <tr>
    <td>getEls(css selector, callback)</td>
    <td>getEls(".state-options", function(stats){// use stats here})</td>
    <td>elements("css selector", ".state-options", function(stats){// use stats here})</td>
  </tr>
  <tr>
    <td>setMaskedElValue(css selector, value, [fieldLength])</td>
    <td>setMaskedElValue(".phone-number", "123456789")</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
   <tr>
    <td>waitForElNotPresent(css selector)</td>
    <td>waitForElNotPresent(".submitButton")</td>
    <td>waitForElementNotPresent(".submitButton")</td>
  </tr>
  <tr>
    <td>getPerformance(url)</td>
    <td>getPerformance("http://www.google.com")</td>
    <td>Retrieves basic performance metrics using Navigation API (http://www.w3.org/TR/navigation-timing/)</td>
  </tr>
</table>

### Enhanced assertion list

<table>
  <tr>
    <th>Nightwatch-extra Assertion</th>
    <th>Example</th>
    <th>Nightwatch Equivalent</th>
  </tr>
  
  <tr>
    <td>assert.elContainsText(css selector, regex or text)</td>
    <td>assert.elContainsText(".username", "testarmada")</td>
    <td>assert.containsText(".username", "testarmada")</td>
  </tr>
  <tr>
    <td>assert.elNotContainsText(css selector, text)</td>
    <td>assert.elNotContainsText(".username", "testarmada")</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
  <tr>
    <td>assert.selectorHasLength(css selector, expectedLength)</td>
    <td>assert.selectorHasLength(".username", 10)</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
  <tr>
    <td>assert.elLengthGreaterThan(css selector, selectUsing, lengthToCompare)</td>
    <td>assert.elLengthGreaterThan(".username", "text", 10)</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
</table>

### As-is Supported Nightwatch Vocabulary

All Nightwatch commands and assertions are supported out of the box.

#### Supported Nightwatch Commands

* Please refer to [Nightwatch Commands API](http://nightwatchjs.org/api#commands) for a list of supported Nightwatch commands

#### Supported Nightwatch Assertions

* Please refer to [Nightwatch Assertions API](http://nightwatchjs.org/api#assertions) for a list of supported Nightwatch assertions

#### Supported Nightwatch Page Object

* All nightwatch-extra commands and assertions fully support nightwatch page object mode. They can be utilized directly if nightwatch page object is being used in your test.

#### Supported Node Assertions

* `fail`
* `equal`
* `notEqual`
* `deepEqual`
* `notDeepEqual`
* `strictEqual`
* `notStrictEqual`
* `throws`
* `doesNotThrow`
* `ifError`