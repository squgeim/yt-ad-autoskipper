import { AD_PLAYBACK_OFFSET } from "../constants/youtube";

/**
 * Returns the number of milliseconds that an ad should be played for given
 * channel.
 *
 * 0 for immediately, -1 for don't skip.
 */
export function getTimeToSkipAdOffset(channelUrl: string): number {
  console.log("channelUrl", channelUrl);
  if (channelUrl === "fs") {
    return -1;
  }

  return AD_PLAYBACK_OFFSET;
}
