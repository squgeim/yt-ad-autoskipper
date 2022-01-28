import { JSXInternal } from "preact/src/jsx";
import { API } from "../constants/api";
import { AuthUser } from "../utils/types";
import Element = JSXInternal.Element;

export function License({ user }: { user: AuthUser | null }): Element {
  return (
    <section class="license">
      <h1>{["Hi", user?.displayName?.split(" ")[0]].join(" ").trim()} 👋</h1>
      {!user?.email && (
        <>
          <p>
            I am a software developer from Nepal, currently living in Toronto.
          </p>
          <p>
            I created YouTube Ad Auto-skipper in 2018 to make my life easier. I
            have been maintaining it during my weekends and evenings while
            juggling a job, school and family. I plan to focus on developing
            much requested functionalities in the near future.
          </p>
          <p>
            I only request 3 cups of coffee ☕️ per year to support the
            development of this extension. Your support will unlock features
            such as muting ads and configuring ad playback length that can also
            be configured for your favorite YouTubers.
          </p>
          <p class="license-highlight">
            The original functionality of automatically skipping ads is and will{" "}
            <span>always remain FREE!</span>
          </p>
          <div class="license-btns">
            <a class="btn btn-primary" href={API.SIGNUP}>
              Unlock additional features for $7 per year
            </a>
            <p>
              Are you already a supporter?{" "}
              <a href={API.ACTIVATE}>Click here to unlock all features.</a>
            </p>
          </div>
        </>
      )}
    </section>
  );
}
