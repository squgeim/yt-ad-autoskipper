import { isInIframe } from "../../utils/dom";
import { VideoAdSkipper } from "./videoAdSkipper";
import { AdMuter } from "./adMuter";
import { VERIFY_SUBSCRIPTION } from "../../constants/actions";
import { ConfigureChannelBtn } from "./configureBtn";
import { BannerAdRemover } from "./bannerAdRemover";
import { YouTubeEvents } from "../../utils/youtubeEvents";

function main() {
  // Only start the script if we are at the top level. YouTube has a few iframes
  // in the page which would also be running this content script.
  if (isInIframe()) {
    return;
  }

  YouTubeEvents.startLoop();

  chrome.runtime.sendMessage({
    type: VERIFY_SUBSCRIPTION,
  });

  new VideoAdSkipper().setupListeners();
  new AdMuter().setupListeners();
  new ConfigureChannelBtn().setupListeners();
  new BannerAdRemover().setupListeners();
}

main();
