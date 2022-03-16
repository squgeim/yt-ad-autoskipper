import {GO_PREF_HOME} from "../constants/actions";
import {AdsChannelPrefForm} from "./channelPrefForm";

export class AdsChannelPref extends HTMLElement {
  static elementName = "ads-channel-pref";

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render = () => {
    if (!this.shadowRoot) return;

    const style = document.createElement("style");
    style.textContent = `
      .channel-pref-header {
        margin-bottom: 1em;
        border-radius: 1em;
        background-color: var(--pref-box-bg);
        padding: 1em;
        display: flex;
        align-items: center;
        text-align: center;
      }

      .back-btn {
        border: none;
        color: inherit;
        border-radius: 50%;
        background: rgba(255,255,255, 0.1);
        width: 3em;
        aspect-ratio: 1;
        font-family: monospace;
        cursor: pointer;
      }

      .channel-logo {
        width: 3em;
        border-radius: 1.5em;
      }

      .channel-pref-title {
        flex: 1;
      }
    `;

    const t = document.createElement("template");
    t.innerHTML += `
      <div class="channel-pref-header">
        <button role="button" class="back-btn">&lt;</button>
        <h2 class="channel-pref-title">${this.getAttribute("channel-name")}</h2>
        <img class="channel-logo" src="${this.getAttribute("image-url")}" alt="" />
      </div>
    `;

    t.content.querySelector("button")?.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: GO_PREF_HOME,
      });
    });

    const form = document.createElement(AdsChannelPrefForm.elementName);
    form.setAttribute("channel-id", this.getAttribute("channel-id") ?? "");
    form.setAttribute("channel-name", this.getAttribute("channel-name") ?? "");
    form.setAttribute("image-url", this.getAttribute("image-url") ?? "");
    this.hasAttribute("is-disabled") && form.setAttribute("is-disabled", "");

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.append(style, t.content, form);
  }
}

customElements.define(AdsChannelPref.elementName, AdsChannelPref);
