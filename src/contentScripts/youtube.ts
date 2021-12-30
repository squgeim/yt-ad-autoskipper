import { clickElem, getElementsByClassNames, isInIframe } from "../utils/dom";
import {
  SKIP_AD_BTN_CLASSES,
  BANNER_AD_BTN_CLASSES,
} from "../constants/youtube";
import { VideoAdSkipper } from "../utils/videoAdSkipper";
import { logger } from "../utils/logger";
import { applyMuteAdConfig } from "../utils/adMuter";
import { injectConfigureBtn } from "../utils/configureBtn";
import { getChannelInfo, isAdPlaying } from "../utils/youtube";

function handlePlayerMutation() {
  logger.debug("Mutation.");

  const elems = getElementsByClassNames(SKIP_AD_BTN_CLASSES);

  if (elems.length && isAdPlaying()) {
    logger.debug("Has ad button.");
    const videoAdSkipper = VideoAdSkipper.getInstance(
      document.location.href,
      elems[0]
    );

    if (!videoAdSkipper.channelUrl) {
      videoAdSkipper.channelUrl = getChannelInfo().channelId;
      logger.debug("channel url: ", videoAdSkipper.channelUrl);
    }

    videoAdSkipper.skipAd();
  }

  applyMuteAdConfig();

  // Banner ads are removed as soon as they appear.
  getElementsByClassNames(BANNER_AD_BTN_CLASSES).forEach((elem) =>
    clickElem(elem)
  );
}

/**
 * Initializes an observer on the YouTube Video Player to get events when any
 * of its child elements change. We can check for the existence of the skip ad
 * buttons on those changes.
 */
function initSkipAdBtnObserver() {
  logger.debug("Setting up observer.");

  if (!("MutationObserver" in window)) {
    return;
  }

  const ytdPlayer = document.querySelector<HTMLElement>("ytd-player");

  if (!ytdPlayer) {
    // If we don't have the video player in the DOM yet, we just try again every
    // 2 seconds until it does (ie, user starts playing a video).

    logger.debug("Failed to set up observer.");

    setTimeout(() => initSkipAdBtnObserver(), 2000);

    return;
  }

  logger.debug("Observer set up complete.");

  const observer = new MutationObserver(handlePlayerMutation);

  observer.observe(ytdPlayer, { childList: true, subtree: true });
}

function main() {
  // Only start the script if we are at the top level. YouTube has a few iframes
  // in the page which would also be running this content script.
  if (isInIframe()) {
    return;
  }

  injectConfigureBtn();
  initSkipAdBtnObserver();
}

main();
