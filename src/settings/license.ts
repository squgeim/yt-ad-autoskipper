import { API } from "../constants/api";

const css = `
a:link,
a:visited {
  color: inherit;
}

a:hover {
  text-decoration: none;
}

.license {
  border-radius: 1em;
  background-color: var(--pref-box-bg);
  border: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1em 1.5em;
  margin-bottom: 3em;
}

.license p {
  line-height: 1.3em;
  margin-bottom: 1em;
  margin-top: 0.25em;
}

.license-btns {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.license-btns .btn {
  flex: 1;
  padding: 1em;
  background: rgba(0,0,0,0.1);
  border-radius: 1em;
  border: none;
  color: inherit;
  font-size: 1em;
  display: block;
  text-decoration: none;
  text-align: center;
}

.license-btns .btn:hover {
  text-decoration: underline;
}

.license-btns .btn-primary {
  background: darkslateblue;
  color: white;
}

.license-btns p {
  opacity: 0.8;
}

p.license-highlight {
  font-weight: bold;
  margin-bottom: 2em;
}

.license-highlight span {
  border-bottom: solid 0.7em orange;
  text-transform: uppercase;
}

ul {
  margin: 0;
}
`;

const template = `
<section class="license">
  <h1>
    <slot name="greeting">
      Hi 👋
    </slot>
  </h1>
  <slot name="message">
    <p>
      I am a software developer from Nepal, currently living in Toronto.
    </p>
    <p>
      I created YouTube Ad Auto-skipper in 2018 to make my life easier. I
      have been maintaining it during my weekends and evenings while
      juggling a job, school and family. I plan to focus on developing much
      requested functionalities in the near future.
    </p>
    <p>
      I only request 3 cups of coffee ☕️ per year to support the
      development of this extension.
    </p>
    <p>Your support will unlock features such as:
      <ul>
        <li>muting ads</li>
        <li>button to end countdown if you want ad to continue playing</li>
        <li>configuring ad playback length before it is skipped</li>
        <li>custom configuration per YouTube channel</li>
      </ul>
    </p>
    <p class="license-highlight">
      The original functionality of automatically skipping ads is and
      will <span>always remain FREE!</span>
    </p>
    <div class="license-btns">
      <a class="btn btn-primary" href="${API.SIGNUP}">
        Unlock additional features for $7 per year
      </a>
      <p>
        Are you already a supporter?
        <a href="${API.ACTIVATE}">Click here to unlock all features.</a>
      </p>
    </div>
  </slot>
</section>`;

export class AdsLicense extends HTMLElement {
  static elementName = "ads-license";

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = css;
    const body = document.createElement("template");
    body.innerHTML = template;

    const root = this.attachShadow({ mode: "open" });
    root.append(style, body.content);
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const user = this.getAttribute("user");

    if (user) {
      this.innerHTML = `
        <slot slot="greeting">Hi ${user.split(" ")[0]} 👋</slot>
        <slot slot="message"></slot>
      `;
    }
  }
}

customElements.define(AdsLicense.elementName, AdsLicense);
