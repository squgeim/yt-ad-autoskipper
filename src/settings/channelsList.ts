import { CONFIGURE_CHANNEL } from "../constants/actions";
import { ChannelConfig, getConfig, removeChannel } from "../utils/config";
import { deepmerge } from "../utils/helpers";

const CSS = `
.pref-box, ul {
  margin-bottom: 1em;
  border-radius: 1em;
  background-color: var(--pref-box-bg);
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-channel-list {
  padding-top: 1em;
}

.empty-channel-list p {
  margin: 0 1.5em 1em;
  padding: 0;
}

.channel-row img {
  height: 2em;
  border-radius: 1em;
}

.channel-row:hover .remove-channel-btn {
  display: block;
}

.channel-row .remove-channel-btn {
  display: none;
  background: inherit;
  border: none;
  height: 2em;
  width: 2em;
  color: white;
  background-color: indianred;
  border-radius: 1em;
}

.pref-row {
  padding: 1em 1.5em;
  border-bottom: 1px solid var(--bg-color);
  display: flex;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  gap: 1em;
}

.pref-row .label {
  flex: 1;
  color: inherit;
  text-decoration: none;
}`;

const TEMPLATE = `
<slot name="empty-list">
  <div class="pref-box empty-channel-list">
    <p>You have not configured any channels yet!</p>
    <p>
      Find Ad Skipper besides the Subscribe button when watching a YouTube
      video. Click on it to configure the extension for that channel.
    </p>
    <img
      src="./preview.png"
      alt="Pointing out Ad Skipper button besides Subscribe button in YouTube."
    />
  </div>
</slot>
`;

type State = {
  channels: ChannelConfig[];
};

export class AdsChannelList extends HTMLElement {
  static elementName = "ads-channel-list";

  _state: State = {
    channels: [],
  };

  get state() {
    return this._state;
  }

  set state(newState: Partial<State>) {
    this._state = deepmerge(this._state, newState);
    this.render();
  }

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = CSS;
    const body = document.createElement("template");
    body.innerHTML = TEMPLATE;

    const root = this.attachShadow({ mode: "open" });
    root.append(style, body.content);
  }

  connectedCallback() {
    const syncChannels = () => {
      getConfig().then((config) => {
        this._state = {
          channels: Object.values(config.channelConfigs).sort((a, b) =>
            a.channelName.localeCompare(b.channelName)
          ),
        };
        this.render();
      });
    };

    syncChannels();

    chrome.storage.onChanged.addListener((changes: Record<string, unknown>) => {
      if ("config" in changes) {
        syncChannels();
      }
    });
  }

  render = () => {
    if (!this.shadowRoot) return;

    this.innerHTML = "";

    const ul = this.shadowRoot.querySelector("ul") || document.createElement("ul");

    if (!this.state.channels?.length) {
      return;
    }

    ul && (ul.innerHTML = "");

    for (const channel of this.state.channels) {
      const li = document.createElement("li");
      li.className = "pref-row channel-row";
      li.onclick = () => {
        chrome.runtime.sendMessage({
          type: CONFIGURE_CHANNEL,
          channel: channel,
        });
      };
      li.innerHTML = `
        <img src=${channel.imageUrl} alt="" />
        <span class="label">
          ${channel.channelName}
        </span>
      `;
      const btn = document.createElement("button");
      btn.className = "remove-channel-btn";
      btn.setAttribute("role", "button");
      btn.title = "Remove channel configuration";
      btn.textContent = "x";
      btn.onclick = (e) => {
        e.stopPropagation();
        removeChannel(channel.channelId);
      };
      li.append(btn);
      ul?.append(li);
    }

    ul.parentElement || this.shadowRoot.prepend(ul);
    this.innerHTML = `<slot slot="empty-list"></slot>`;
  };
}

customElements.define(AdsChannelList.elementName, AdsChannelList);
