import { CONFIGURE_CHANNEL, GO_PREF_HOME } from "../constants/actions";
import { logger } from "../utils/logger";

function configureChannel({
  channelId,
  channelName,
  imageUrl,
}: {
  channelId: string;
  channelName: string;
  imageUrl: string;
}) {
  logger.debug("ChannelId: ", channelId);
  chrome.storage.local
    .set({
      page: `channel`,
      pageProps: {
        channelId,
        channelName,
        imageUrl,
      },
    })
    .then(() => {
      chrome.runtime.openOptionsPage();
    });
}

function goPrefHome() {
  logger.debug("Going home");
  chrome.storage.local
    .set({
      page: `pref`,
      pageProps: {},
    })
    .then(() => {
      chrome.runtime.openOptionsPage();
    });
}

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
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
