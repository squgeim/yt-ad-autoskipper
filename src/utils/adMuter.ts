import { logger } from "./logger";
import { getShouldMuteAd } from "./config";
import { clickMuteBtn, isAdPlaying, isVideoMuted } from "./youtube";

let currentState: "ad" | "video";

export async function applyMuteAdConfig(): Promise<void> {
  const nextState = getCurrentVideoState();
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

  if (isVideoMuted() || !stateChanged) {
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
  if (isVideoMuted()) {
    logger.debug("resetting audio.");
    clickMuteBtn();
  }
}

function getCurrentVideoState() {
  return isAdPlaying() ? "ad" : "video";
}
