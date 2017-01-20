import Local from "./local";
import Sauce from "./sauce";

const executors = {
  local: Local,
  sauce: Sauce
};

export default class ExecutorFactory {
  constructor(type) {
    // work around here since we dont have executor integrated in magellan
    let exe = "sauce";
    if (type !== "sauce") {
      exe = "local";
    }

    return executors[exe];
  }
}
