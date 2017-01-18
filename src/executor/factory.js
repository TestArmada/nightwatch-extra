"use strict";

import util from "util";
import Local from "./local";
import Sauce from "./sauce";

const executors = {
  local: Local,
  sauce: Sauce
}

export default class ExecutorFactory {
  constructor(type) {
    if (executors[type]) {
      return executors[type];
    }

    throw new Error("No such executor found in lib/executor/");
  }
};