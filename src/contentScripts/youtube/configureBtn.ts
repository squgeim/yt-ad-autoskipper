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
      if (!this.hasButton()) {
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

  private hasButton() {
    return !!document.querySelector("#yas_config_channel_btn");
  }

  private createButton() {
    if (this.hasButton()) {
      return;
    }

    const related = document.querySelector("#related");

    if (!related) {
      logger.debug("Could not palce config button. Will try again next tick.");

      return;
    }

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";

    const btn = document.createElement("a");
    btn.id = "yas_config_channel_btn";
    btn.title = "Configure ad skipping for this channel";
    btn.innerHTML = `Configure Ads for this channel`;
    btn.style.lineHeight = "1.5em";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "1.2em";
    btn.style.borderBottom = "1px solid var(--yt-spec-text-primary, black)";
    btn.style.marginBottom = "1em";

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

    related.insertAdjacentElement("beforebegin", div);
  }
}
