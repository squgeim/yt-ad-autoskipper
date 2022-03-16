import deepmerge from "deepmerge";
import {AdsChannelList} from "./channelsList";
import {API} from "../constants/api";
import {getSubscription} from "../utils/config";
import {logger} from "../utils/logger";
import {AuthUser} from "../utils/types";
import {AdsChannelPref} from "./channelPref";
import {AdsChannelPrefForm} from "./channelPrefForm";
import {AdsLicense} from "./license";

type State = {
  user: AuthUser | null;
  page: "pref" | "channel";
  pageProps: Record<string, unknown>;
};

class AdsSettings extends HTMLElement {
  static elementName = "ads-settings";

  _state: State = {
    user: null,
    page: "pref",
    pageProps: {},
  };

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.attachListenerForPageChange();

    Promise.all([
      this.getUserFromStorage(),
      this.getPageFromStorage()
    ]).then(([user, { page, pageProps }]) => {
      this.state = {
        user,
        page,
        pageProps,
      };
    });
  }

  get state(): State {
    return this._state;
  }

  set state(newState: Partial<State>) {
    this._state = deepmerge<State>(
      this._state,
      newState
    );
    this.render();
  };

  render = () => {
    if (!this.shadowRoot) return;

    const style = document.createElement("style");
    style.textContent = `
a:link,
a:visited {
  color: inherit;
}

.container {
  margin: 2em auto;
  max-width: 32em;
  opacity: 1;
  animation: animate-in 0.1s ease-in;
}

@keyframes animate-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1
  }
}

.container h1, .container h2 {
  font-weight: normal;
}

h2.title {
  margin: 1em;
  font-size: 0.9em;
  opacity: 0.8;
  flex: 1;
  text-transform: uppercase;
}

.pref-desc {
  margin: 0;
  margin-top: 0.5em;
  font-size: 0.8em;
  opacity: 0.5;
  text-transform: none;
}
.pref-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.license-footer {
  opacity: 0.5;
  font-size: 0.9em;
  text-align: center;
}
    `;

    const container = document.createElement("div");
    container.className = "container";
    container.innerHTML = `
      <h1>Youtube Ad Auto-skipper</h1>
    `;

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.append(style, container);

    if (this.state.page === "channel" && this.state.user) {
      const { channelId, channelName, imageUrl } = this.state.pageProps;

      const page = document.createElement(AdsChannelPref.elementName);
      page.setAttribute("channel-id", channelId as string);
      page.setAttribute("channel-name", channelName as string);
      page.setAttribute("image-url", imageUrl as string);

      container.append(page);

      return;
    }

    const license = document.createElement(AdsLicense.elementName);
    license.setAttribute("user", this.state.user?.displayName || "");
    container.append(license);

    const globalPref = document.createElement("div");
    globalPref.className = !this.state.user ? "pref-disabled" : "";
    globalPref.innerHTML = `
      <h2 class="title">
        Global Preferences
        <p class="pref-desc">
          These preferences will be used for all videos unless there is a
          specific configuration for a YouTube channel defined below.
        </p>
      </h2>
    `;
    const channelPrefForm = document.createElement(AdsChannelPrefForm.elementName);
    !this.state.user && channelPrefForm.setAttribute("is-disabled", "true");
    globalPref.append(channelPrefForm);
    container.append(globalPref);

    const channelPref = document.createElement("div");
    channelPref.className = !this.state.user ? "pref-disabled" : "";
    channelPref.innerHTML = `
      <h2 class="title">
        Channel Preferences
        <p class="pref-desc">
          You can configure Ad-Skipper to have a different behavior in videos
          by your favourite YouTubers.
        </p>
      </h2>
    `;
    channelPref.append(document.createElement(AdsChannelList.elementName));
    container.append(channelPref);

    if (this.state.user) {
      container.innerHTML += `
        <div class="license-footer">
          <p>
            You support the development of this extension with an annual payment.
            <br />
            <a href=${API.CANCEL}>Click here to cancel future payments.</a>
          </p>
        </div>
      `;
    }
  }

  getUserFromStorage = async () => {
    const subscription = await getSubscription();
    logger.debug("subscription", subscription);

    return subscription?.user || null;
  };

  getPageFromStorage = async () => {
    const { page, pageProps } = await chrome.storage.local.get([
      "page",
      "pageProps",
    ]);

    if (!page) {
      return {
        page: this.state.page,
        pageProps: this.state.pageProps,
      };
    }

    await chrome.storage.local.remove(["page", "pageProps"]);

    return { page, pageProps };
  };

  attachListenerForPageChange = () => {
    const handlePageChange = async () => {
      const { page, pageProps } = await this.getPageFromStorage();

      this.state = {
        page,
        pageProps,
      };
    };

    const handleMessage = (changes: Record<string, unknown>) => {
      if ("page" in changes) {
        handlePageChange();
      }
    };

    chrome.storage.onChanged.addListener(handleMessage);
  }
}

customElements.define(AdsSettings.elementName, AdsSettings);
