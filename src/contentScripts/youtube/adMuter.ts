import { logger } from "../../utils/logger";
import { getShouldMuteAd } from "../../utils/config";
import {
  clickMuteBtn,
  getChannelInfo,
  isVideoMuted,
} from "../../utils/youtubeDOM";
import { Events, YouTubeEvents } from "../../utils/youtubeEvents";

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
