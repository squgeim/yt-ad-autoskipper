import { logger } from "./logger";
import { clickElem, getElementsByClassNames } from "./dom";

export function isVideoMuted(): boolean {
  const volumeSlider = document.querySelector<HTMLElement>(
    ".ytp-volume-slider-handle"
  );

  return parseInt(volumeSlider?.style.left || "0") === 0;
}

export function clickSkipAdBtn(): void {
  const elems = getElementsByClassNames([
    "videoAdUiSkipButton", // Old close ad button
    "ytp-ad-skip-button ytp-button", // New close ad button
    "ytp-ad-skip-button-modern ytp-button", // Modern close ad button
  ]);
  logger.debug("clicking on elems: ", elems);
  elems.forEach((el) => clickElem(el));
}

export function clickMuteBtn(): void {
  logger.debug("click mute button.");
  const muteBtn = document.querySelector<HTMLElement>(".ytp-mute-button");

  if (!muteBtn) {
    logger.debug("mute button not present.");

    return;
  }

  clickElem(muteBtn);
}

export function getChannelInfo(): {
  channelId: string;
  channelName: string;
  imageUrl: string;
} {
  const channelA = document.querySelector<HTMLAnchorElement>(
    "ytd-video-owner-renderer ytd-channel-name a"
  );

  if (!channelA) {
    return {
      channelId: "",
      channelName: "",
      imageUrl: "",
    };
  }

  const channelName = channelA.innerText;
  const channelId = channelA.href.split("/").pop() || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>("ytd-video-owner-renderer img")
      ?.src || "";

  return {
    imageUrl,
    channelId,
    channelName,
  };
}

export function isVideoPage(): boolean {
  return document.location.pathname === "/watch";
}
