import { CONFIGURE_CHANNEL } from "../../constants/actions";
import { logger } from "../../utils/logger";
import { EventHandler } from "../../utils/types";
import { isVideoPage, getChannelInfo } from "../../utils/youtubeDOM";
import { YouTubeEvents, Events } from "../../utils/youtubeEvents";

export class ConfigureChannelBtn implements EventHandler {
  tryAgain = false;

  public setupListeners(): void {
    YouTubeEvents.addListener(Events.locationChanged, (_, { location }) => {
      logger.debug("location change: ", location);
      this.handleLocation();
    });
    YouTubeEvents.addListener(Events.tick, () => {
      if (this.tryAgain) {
        logger.debug("trying to create config button again.");
        this.tryAgain = false;
        this.createButton();
      }
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

    const uploadInfo = document.querySelector(
      "ytd-video-secondary-info-renderer #upload-info"
    );

    if (!uploadInfo) {
      logger.debug("Could not palce config button. Will try again next tick.");
      this.tryAgain = true;

      return;
    }

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginRight = "3px";

    const btn = document.createElement("button");
    btn.id = "yas_config_channel_btn";
    btn.title = "Configure ad skipping for this channel";
    btn.innerHTML = `
      <img height="100%" src="https://github.com/squgeim/yt-ad-autoskipper/raw/master/src/dist/logo.png" alt="" />
    `;
    btn.style.height = "36px";
    btn.style.backgroundColor = "white";
    btn.style.border = "1px solid steelblue";
    btn.style.borderRadius = "2px";
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

    div.append(btn);

    uploadInfo?.insertAdjacentElement("afterend", div);
  }
}
