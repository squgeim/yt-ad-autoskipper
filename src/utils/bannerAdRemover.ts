import { BANNER_AD_BTN_CLASSES } from "../constants/youtube";
import { getElementsByClassNames, clickElem } from "./dom";
import { Events, YouTubeEvents } from "./youtubeEvents";

export class BannerAdRemover {
  public setupListeners(): void {
    // Banner ads are removed as soon as they appear.
    YouTubeEvents.addListener(Events.tick, () => {
      getElementsByClassNames(BANNER_AD_BTN_CLASSES).forEach((elem) =>
        clickElem(elem)
      );
    });
  }
}
