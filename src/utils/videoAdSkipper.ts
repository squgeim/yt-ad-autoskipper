import { clickElem, isElementVisible } from "./dom";
import { AD_PLAYBACK_OFFSET } from "../constants/youtube";
import { getTimeToSkipAdOffset } from "./config";
import { addMilliseconds } from "./datetime";
import { logger } from "./logger";

export class VideoAdSkipper {
  static instance?: VideoAdSkipper;
  readonly #videoUrl: string;
  readonly #button: HTMLElement;
  #channelId?: string;
  #timeoutId?: number;

  static getInstance(
    videoUrl: string,
    buttonElem: HTMLElement
  ): VideoAdSkipper {
    if (
      !VideoAdSkipper.instance ||
      (VideoAdSkipper.instance &&
        VideoAdSkipper.instance.#videoUrl !== videoUrl)
    ) {
      VideoAdSkipper.instance = new VideoAdSkipper(videoUrl, buttonElem);
    }

    return VideoAdSkipper.instance;
  }

  constructor(videoUrl: string, buttonElem: HTMLElement) {
    this.#videoUrl = videoUrl;
    this.#button = buttonElem;
  }

  #teardown(): void {
    clearTimeout(this.#timeoutId);
  }

  #clickButton(): void {
    clickElem(this.#button);
    this.#teardown();
    VideoAdSkipper.instance = undefined;
  }

  set channelId(url: string) {
    if (this.#channelId === url) {
      return;
    }

    this.#channelId = url;

    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = undefined;

      this.skipAd();
    }
  }

  get channelId(): string {
    return this.#channelId ?? "";
  }

  async skipAd(): Promise<void> {
    if (this.#timeoutId) {
      return;
    }

    logger.debug("Channel url", this.#channelId);

    // If the Skip Ad button is visible, it means that the Ad has already played
    // for 5 seconds.
    const adPlaybackOffset = isElementVisible(this.#button)
      ? AD_PLAYBACK_OFFSET
      : 0;

    logger.debug("Ad playback offset", adPlaybackOffset);

    const timeToSkipAdOffset =
      (await getTimeToSkipAdOffset(this.#channelId ?? "")) * 1000;

    logger.debug("Time to skip ad offset", timeToSkipAdOffset);

    if (timeToSkipAdOffset < 0) {
      // This means we are not skipping ads for this channel.
      return;
    }

    const now = new Date();
    const adPlaybackStart = addMilliseconds(now, -adPlaybackOffset);
    const skipAdAt = addMilliseconds(adPlaybackStart, timeToSkipAdOffset);

    if (now >= skipAdAt) {
      logger.debug("now > skipAdAt");

      return this.#clickButton();
    }

    logger.debug("skipAdAt - now =", skipAdAt.getTime() - now.getTime());

    this.#timeoutId = window.setTimeout(() => {
      this.#clickButton();
    }, skipAdAt.getTime() - now.getTime());
  }
}
