import { CONFIGURE_CHANNEL } from "../../constants/actions";
import { logger } from "../../utils/logger";
import { isVideoPage, getChannelInfo } from "../../utils/youtubeDOM";
import { YouTubeEvents, Events } from "../../utils/youtubeEvents";

export class ConfigureChannelBtn {
  public setupListeners(): void {
    YouTubeEvents.addListener(Events.locationChanged, (_, { location }) => {
      logger.debug("location change: ", location);
      this.handleLocation();
    });
    this.createButton();
  }

  private handleLocation() {
    if (!isVideoPage()) {
      return;
    }

    this.createButton();
  }

  private createButton() {
    const hasButton = document.querySelector("#yas_config_channel_btn");

    if (hasButton) {
      return;
    }

    const btn = document.createElement("button");
    btn.id = "yas_config_channel_btn";
    btn.title = "Configure ad skipping for this channel";
    btn.innerHTML = `
      <img height="100%" src="https://github.com/squgeim/yt-ad-autoskipper/raw/master/src/dist/logo.png" alt="" />
    `;
    btn.style.height = "36px";
    btn.style.marginTop = "6px";
    btn.style.marginBottom = "6px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      const { channelId, channelName, imageUrl } = getChannelInfo();
      logger.debug("configure channel: ", channelId);

      chrome.runtime.sendMessage({
        type: CONFIGURE_CHANNEL,
        channel: {
          channelId,
          channelName,
          imageUrl,
        },
      });
    };

    const subscribeBtn = document.querySelector(
      "ytd-video-secondary-info-renderer #subscribe-button"
    );
    subscribeBtn?.parentElement?.insertBefore(btn, subscribeBtn);
  }
}
