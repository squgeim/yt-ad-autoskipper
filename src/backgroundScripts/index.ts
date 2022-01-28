import {
  CONFIGURE_CHANNEL,
  GO_PREF_HOME,
  VERIFY_SUBSCRIPTION,
} from "../constants/actions";
import { logger } from "../utils/logger";
import {
  completeCheckout,
  configureChannel,
  goPrefHome,
  loginSuccess,
  verifySubscription,
} from "./services";

chrome.runtime.onMessage.addListener((message) => {
  if (!("type" in message)) {
    return;
  }

  logger.debug("Message received: ", message);

  switch (message.type) {
    case CONFIGURE_CHANNEL:
      configureChannel(message.channel);
      break;
    case GO_PREF_HOME:
      goPrefHome();
      break;
    case VERIFY_SUBSCRIPTION:
      verifySubscription();
      break;
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender) => {
  if (!("type" in message)) {
    return;
  }

  logger.debug("External message received: ", message);
  logger.debug("Message from: ", sender.tab);

  switch (message.type) {
    case "LOGIN_SUCCESS": {
      loginSuccess(message.user, sender.tab as chrome.tabs.Tab);
      break;
    }
    case "COMPLETE_CHECKOUT":
      completeCheckout(message.success, sender.tab as chrome.tabs.Tab);
      break;
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();

    return;
  }

  if (details.reason === "update") {
    chrome.storage.local.get(["subscription"]).then(({ subscription }) => {
      if (!subscription) {
        chrome.runtime.openOptionsPage();
      }
    });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
