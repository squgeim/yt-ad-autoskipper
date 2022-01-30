import { clickElem, getElementsByClassNames } from "./dom";
import { SKIP_AD_BTN_CLASSES } from "../constants/youtube";
import { getTimeToSkipAdOffset } from "./config";
import { addMilliseconds } from "./datetime";
import { logger } from "./logger";
import { Events, YouTubeEvents } from "./youtubeEvents";
import { getChannelInfo } from "./youtube";

export class VideoAdSkipper {
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
      const elems = getElementsByClassNames(SKIP_AD_BTN_CLASSES);
      logger.debug("clicking on elems: ", elems);
      elems.forEach((el) => clickElem(el));
      this.teardown();
    }
  }
}
