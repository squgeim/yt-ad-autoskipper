import { logger } from "./logger";
import { clickElem } from "./dom";
import { getShouldMuteAd } from "./config";

let currentState: "ad" | "video";

export async function applyMuteAdConfig(): Promise<void> {
  const nextState = getCurrentState();
  const stateChanged = nextState !== currentState;
  currentState = nextState;

  logger.debug("current state: ", nextState);

  if (currentState === "video") {
    if (stateChanged) {
      logger.debug("state changed");
      resetSound();
    }

    return;
  }

  if (isMuted() || !stateChanged) {
    logger.debug("video is muted or state did not change. Doing nothing.");

    return;
  }

  const channelUrl =
    document.querySelector<HTMLAnchorElement>(
      "ytd-video-owner-renderer ytd-channel-name a"
    )?.href ?? "";

  if (await getShouldMuteAd(channelUrl)) {
    logger.debug("video is NOT muted. Click button.");
    clickMuteBtn();
  } else {
    logger.debug("Not muting ad for this channel: ", channelUrl);
  }
}

function resetSound(): void {
  if (isMuted()) {
    logger.debug("resetting audio.");
    clickMuteBtn();
  }
}

function isMuted() {
  const volumeSlider = document.querySelector<HTMLElement>(
    ".ytp-volume-slider-handle"
  );

  return parseInt(volumeSlider?.style.left || "0") === 0;
}

function clickMuteBtn() {
  logger.debug("click mute button.");
  const muteBtn = document.querySelector<HTMLElement>(".ytp-mute-button");
  muteBtn && clickElem(muteBtn);
}

function getCurrentState() {
  return isAdPlaying() ? "ad" : "video";
}

export function isAdPlaying(): boolean {
  return !!document.querySelector(".html5-video-player.ad-showing");
}
