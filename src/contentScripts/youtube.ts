import {
  clickElem,
  getElementsByClassNames,
  isElementVisible,
  isInIframe,
} from "../utils/dom";
import { addMilliseconds } from "../utils/datetime";
import {
  SKIP_AD_BTN_CLASSES,
  BANNER_AD_BTN_CLASSES,
  AD_PLAYBACK_OFFSET,
} from "../constants/youtube";
import { getTimeToSkipAdOffset } from "../utils/config";

/**
 * Initializes an observer on the YouTube Video Player to get events when any
 * of its child elements change. We can check for the existence of the skip ad
 * buttons on those changes.
 */
function initSkipAdBtnObserver() {
  if (!("MutationObserver" in window)) {
    return;
  }

  const ytdPlayer = document.querySelector("ytd-player");

  if (!ytdPlayer) {
    // If we don't have the video player in the DOM yet, we just try again every
    // 2 seconds until it does (ie, user starts playing a video).

    setTimeout(() => initSkipAdBtnObserver(), 2000);

    return;
  }

  let teardownProcessor: ProcessorTeardownCb | undefined;
  const observer = new MutationObserver(() => {
    const elems = getElementsByClassNames(SKIP_AD_BTN_CLASSES);

    if (elems.length) {
      teardownProcessor?.();
      teardownProcessor = processSkipAdButton(elems[0]);
    }

    // Banner ads are removed as soon as they appear.
    getElementsByClassNames(BANNER_AD_BTN_CLASSES).forEach((elem) =>
      clickElem(elem)
    );
  });

  observer.observe(ytdPlayer, { childList: true, subtree: true });
}

type ProcessorTeardownCb = () => void;

function processSkipAdButton(
  elem: HTMLElement
): ProcessorTeardownCb | undefined {
  const channelUrl = document.querySelector<HTMLAnchorElement>(
    "ytd-video-owner-renderer ytd-channel-name a"
  )?.href;

  // If the Skip Ad button is visible, it means that the Ad has already played
  // for 5 seconds.
  const adPlaybackOffset = isElementVisible(elem) ? AD_PLAYBACK_OFFSET : 0;
  const timeToSkipAdOffset = getTimeToSkipAdOffset(channelUrl ?? "");

  if (timeToSkipAdOffset < 0) {
    // This means we are not skipping ads for this channel.
    return;
  }

  const now = new Date();
  const adPlaybackStart = addMilliseconds(now, -adPlaybackOffset);
  const skipAdAt = addMilliseconds(adPlaybackStart, timeToSkipAdOffset);

  if (now >= skipAdAt) {
    clickElem(elem);

    return;
  }

  const timeoutId = setTimeout(() => {
    clickElem(elem);
  }, skipAdAt.getTime() - now.getTime());

  return () => clearTimeout(timeoutId);
}

function main() {
  // Only start the script if we are at the top level. YouTube has a few iframes
  // in the page which would also be running this content script.
  if (isInIframe()) {
    return;
  }

  initSkipAdBtnObserver();
}

main();
