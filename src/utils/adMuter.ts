import { logger } from "./logger";
import { getShouldMuteAd } from "./config";
import { clickMuteBtn, getChannelInfo, isVideoMuted } from "./youtube";
import { Events, YouTubeEvents } from "./youtubeEvents";

export class AdMuter {
  public setupListeners(): void {
    YouTubeEvents.addListener(Events.adPlayStarted, () =>
      this.handleAdPlaybackStart()
    );
    YouTubeEvents.addListener(Events.adPlayEnded, () => this.resetSound());
  }

  private async handleAdPlaybackStart() {
    if (isVideoMuted()) {
      return;
    }

    const { channelId } = getChannelInfo();

    if (await getShouldMuteAd(channelId)) {
      logger.debug("video is NOT muted. Click button.");
      clickMuteBtn();
    } else {
      logger.debug("Not muting ad for this channel: ", channelId);
    }
  }

  private resetSound(): void {
    if (isVideoMuted()) {
      logger.debug("resetting audio.");
      clickMuteBtn();
    }
  }
}
