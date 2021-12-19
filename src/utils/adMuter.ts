import { logger } from "./logger";
import { clickElem } from "./dom";

export function applyMuteAdConfig(): void {
  if (!isAdPlaying()) {
    resetSound();

    return;
  }

  if (isMuted()) {
    logger.debug("video is muted. Doing nothing.");

    return;
  }

  logger.debug("video is NOT muted. Click button.");
  clickMuteBtn();
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
