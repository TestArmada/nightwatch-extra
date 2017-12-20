import settings from "../settings";

/* eslint-disable max-len */
module.exports = {
  BUILTIN_BAD_GATEWAY: "Error connecting to server. Server may not have started propertly or there may be a problem with the network.",

  BUILTIN_SELECTOR_NOT_FOUND: () => `-> Element wasn't found in < ${settings.COMMAND_MAX_TIMEOUT} > ms`,
  BUILTIN_SELECTOR_NOT_VISIBLE: "-> Element was found but failed in jQuery:visible check",
  BUILTIN_ATTRIBUTE_NOT_FOUND: "-> Element with attribute name could not be found.",
  BUILTIN_ACTUAL_NOT_MEET_EXPECTED: "-> Assertion failure ",
  BUILTIN_COMMAND_TIMEOUT: () => `-> Command timeout - haven't heard back from selenium server in < ${settings.COMMAND_MAX_TIMEOUT} > ms`,

  BUILTIN_SELENIUM_ERROR: "-> An unexpected error occured in selenium server",
  BUILTIN_ELEMENT_NOT_OPERABLE: "-> Element wasn't operable on mobile device",
  BUILTIN_COMMAND_NOT_SUPPORTED: "-> Command isn't supported by current platform"
};
