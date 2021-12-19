import { logger } from "./logger";
import { clickElem } from "./dom";
import { getShouldMuteAd } from "./config";

export async function applyMuteAdConfig(): Promise<void> {
  if (!isAdPlaying()) {
    resetSound();

    return;
  }

  if (isMuted()) {
    logger.debug("video is muted. Doing nothing.");

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
  const muteBtn = document.querySelector<HTMLElement>(".ytp-mute-button");
  muteBtn && clickElem(muteBtn);
}

function isAdPlaying() {
  return !!document.querySelector(".ytp-ad-module")?.childElementCount;
}
