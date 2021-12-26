import { CONFIGURE_CHANNEL } from "../constants/actions";

function configureChannel(channelId: string) {
  console.log("ChannelId: ", channelId);
  chrome.storage.local
    .set({
      page: `channel`,
      pageProps: {
        channelId,
      },
    })
    .then(() => {
      chrome.runtime.openOptionsPage();
    });
}

chrome.runtime.onMessage.addListener((message) => {
  if (!("type" in message)) {
    return;
  }

  switch (message.type) {
    case CONFIGURE_CHANNEL:
      configureChannel(message.channelId);
      break;
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
