import { AD_PLAYBACK_OFFSET } from "../constants/youtube";

/**
 * Returns the number of milliseconds that an ad should be played for given
 * channel.
 *
 * 0 for immediately, -1 for don't skip.
 */
export function getTimeToSkipAdOffset(channelUrl: string): number {
  switch (channelUrl) {
    // Economics Explained
    case "https://www.youtube.com/channel/UCZ4AMrDcNrfy3X6nsU8-rPg":
      return 10000;
    default:
      return AD_PLAYBACK_OFFSET;
  }
}
