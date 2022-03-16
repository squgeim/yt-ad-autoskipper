import deepmerge from "deepmerge";
import {createChannel, DEFAULT_CONFIG, getChannelConfig, getShouldMuteAd, getTimeToSkipAdOffset, setShouldMuteAd, setTimeToSkipAdOffset} from "../utils/config";
import {logger} from "../utils/logger";

type State = {
  isMute: boolean,
  skipSecs: number,
};

export class AdsChannelPrefForm extends HTMLElement {
  static elementName = "ads-channel-pref-form";

  _state: State = {
    isMute: false,
    skipSecs: 0,
  };

  props = {
    channelId: "",
    channelName: "",
    imageUrl: "",
    isDisabled: false,
  }

  shouldCreateChannel = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.props = {
      channelId: this.getAttribute("channel-id") ?? "",
      channelName: this.getAttribute("channel-name") ?? "",
      imageUrl: this.getAttribute("image-url") ?? "",
      isDisabled: this.hasAttribute("is-disabled"),
    };

    getChannelConfig(this.props.channelId || "global")
      .then((config) => {
        logger.debug("initializing form with config: ", config);

        if (!config) {
          this.shouldCreateChannel = true;
          this._state = {
            skipSecs: DEFAULT_CONFIG.globalConfig.timeToSkip,
            isMute: DEFAULT_CONFIG.globalConfig.muteAd,
          };

          return;
        }

        this._state = {
          skipSecs: config.timeToSkip,
          isMute: config.muteAd,
        };
      })
      .then(() => this.render());
  }

  get state(): State {
    return this._state;
  }

  set state(newState: Partial<State>) {
    this._state = deepmerge(
      this._state,
      newState
    );

    this.render();
  }

  render = () => {
    if (!this.shadowRoot) return;

    const style = document.createElement("style");
    style.textContent = `
.pref-box {
  margin-bottom: 1em;
  border-radius: 1em;
  background-color: var(--pref-box-bg);
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pref-box .pref-row {
  padding: 1em 1.5em;
  border-bottom: 1px solid var(--bg-color);
  display: flex;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  gap: 1em;
}

.pref-box .pref-row:last-child {
  border-bottom: none;
}

.pref-box .pref-row input {
  width: 2.5em;
  text-align: right;
}

.pref-box .pref-row input[type="checkbox"] {
  height: 1.5em;
}

.pref-box .pref-row .label {
  flex: 1;
  color: inherit;
  text-decoration: none;
}

.pref-desc {
  margin: 0;
  margin-top: 0.5em;
  font-size: 0.8em;
  opacity: 0.5;
  text-transform: none;
}
    `;

    const muteAdsRow = document.createElement("label");
    muteAdsRow.className = "pref-row";
    muteAdsRow.innerHTML = `
      <div class="label">
        <span>Mute Ads</span>
        <p class="pref-desc">Ads will be muted when they start playing.</p>
      </div>
    `;
    const toggleMuteInput = document.createElement("input");
    toggleMuteInput.type = "checkbox";
    toggleMuteInput.onchange = this.toggleIsMute;
    this.props.isDisabled && toggleMuteInput.setAttribute("disabled", "");
    this.state.isMute && toggleMuteInput.setAttribute("checked", "");
    muteAdsRow.append(toggleMuteInput);

    const skipSecsRow = document.createElement("label");
    skipSecsRow.className = "pref-row";
    skipSecsRow.innerHTML = `
      <div class="label">
        <span>Seconds to play ad before skipping</span>
        <p class="pref-desc">
          Ads will play for the supplied number of seconds before they are
          skiped. The default value is 5 seconds as that is when YouTube
          makes the "Skip Ad" button visible, but the value can be as low as
          0, where you won't see any ads.
        </p>
        <p class="pref-desc">
          You can let ads play longer for you favorite YouTubers and skip
          them quickly for other videos.
        </p>
      </div>
    `;
    const skipSecsInput = document.createElement("input");
    skipSecsInput.type = "number";
    skipSecsInput.value = "" + this.state.skipSecs;
    skipSecsInput.onchange = this.updateSkipSecs;
    this.props.isDisabled && skipSecsInput.setAttribute("disabled", "");
    skipSecsRow.append(skipSecsInput);

    const fieldset = document.createElement("fieldset");
    fieldset.className = "pref-box";
    fieldset.append(muteAdsRow, skipSecsRow);

    const form = document.createElement("form");
    form.append(fieldset);

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.append(style, form);
  }

  createChannelIfRequired = async () => {
    if (
      this.shouldCreateChannel &&
      this.props.channelId &&
      this.props.channelName &&
      this.props.imageUrl
    ) {
      await createChannel(
        this.props.channelId,
        this.props.channelName,
        this.props.imageUrl
      );
    }
  }

  updateSkipSecs = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const val = +input.value;

    if (isNaN(val)) {
      input.value = "" + this.state.skipSecs;

      return;
    }

    input.value = "" + val;

    this.createChannelIfRequired()
      .then(() => setTimeToSkipAdOffset(this.props.channelId || "global", val))
      .catch(() => {
        getTimeToSkipAdOffset()
          .then((newVal) => {
            this.state = {
              skipSecs: newVal,
            };
          })
      });
  }

  toggleIsMute = () => {
    this.createChannelIfRequired()
      .then(() => setShouldMuteAd(this.props.channelId || "global", !this.state.isMute))
      .catch(() => {
        getShouldMuteAd()
          .then((newVal) => {
            this.state = {
              isMute: newVal,
            };
          })
      });
  }
}

customElements.define(AdsChannelPrefForm.elementName, AdsChannelPrefForm);
