import { logger } from "./logger";
import { clickElem } from "./dom";

export function isAdPlaying(): boolean {
  return !!document.querySelector(".html5-video-player.ad-showing");
}

export function isVideoMuted(): boolean {
  const volumeSlider = document.querySelector<HTMLElement>(
    ".ytp-volume-slider-handle"
  );

  return parseInt(volumeSlider?.style.left || "0") === 0;
}

export function clickMuteBtn(): void {
  logger.debug("click mute button.");
  const muteBtn = document.querySelector<HTMLElement>(".ytp-mute-button");
  muteBtn && clickElem(muteBtn);
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
