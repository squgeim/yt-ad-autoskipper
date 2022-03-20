import { getTimeToSkipAdOffset } from "../../utils/config";
import { addMilliseconds } from "../../utils/datetime";
import { logger } from "../../utils/logger";
import { Events, YouTubeEvents } from "../../utils/youtubeEvents";
import { clickSkipAdBtn, getChannelInfo } from "../../utils/youtubeDOM";
import { EventHandler } from "../../utils/types";

export class VideoAdSkipper implements EventHandler {
  #skipAt: Date | null = null;

  public setupListeners(): void {
    YouTubeEvents.addListener(Events.adPlayStarted, () => this.scheduleClick());
    YouTubeEvents.addListener(Events.adPlayEnded, () => this.teardown());
    YouTubeEvents.addListener(Events.tick, () => this.tick());
    logger.debug("listeners set up for ad skipper");
  }

  private teardown(): void {
    this.#skipAt = null;
  }

  private async scheduleClick(): Promise<void> {
    const { channelId } = getChannelInfo();
    const skipAdTime = await getTimeToSkipAdOffset(channelId);

    if (skipAdTime < 0) {
      this.#skipAt = null;
      logger.debug("not skipping ad");

      return;
    }

    this.#skipAt = addMilliseconds(new Date(), skipAdTime * 1000);
    logger.debug("scheduling skip at ", this.#skipAt);
  }

  private tick(): void {
    if (!this.#skipAt) {
      return;
    }

    if (this.#skipAt <= new Date()) {
      clickSkipAdBtn();
      this.teardown();
    }
  }
}
