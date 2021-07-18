import {
  clickElem,
  getElementsByClassNames,
  isElementVisible,
  isInIframe,
} from "../utils/dom";
import { addMilliseconds } from "../utils/datetime";

const SKIP_AD_BTN_CLASSES = [
  "videoAdUiSkipButton", // Old close ad button
  "ytp-ad-skip-button ytp-button", // New close ad button
];

const BANNER_AD_BTN_CLASSES = [
  "ytp-ad-overlay-close-button", // Close overlay button
];

/**
 * Initializes an observer on the YouTube Video Player to get events when any
 * of its child elements change. We can check for the existence of the skip ad
 * buttons on those changes.
 */
function initSkipAdBtnObserver() {
  if (!("MutationObserver" in window)) {
    return;
  }

  const ytdPlayer = ((nodeList) => {
    return nodeList && nodeList[0];
  })(document.getElementsByTagName("ytd-player"));

  if (!ytdPlayer) {
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
  /**
   * If the Skip Ad button is visible, it means that the Ad has already played
   * for 5 seconds.
   */
  const adPlaybackOffset = isElementVisible(elem) ? -5000 : 0;
  const timeToSkipAdOffset = 5000; // 0 for immediately

  const now = new Date();
  const adPlaybackStart = addMilliseconds(now, adPlaybackOffset);
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
  /**
   * Only start the script if we are at the top level. YouTube has a few iframes
   * in the page which would also be running this content script.
   */
  if (isInIframe()) {
    return;
  }

  initSkipAdBtnObserver();
}

main();
