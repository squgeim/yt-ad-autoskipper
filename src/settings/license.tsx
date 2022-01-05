import { JSXInternal } from "preact/src/jsx";
import { AuthUser } from "../utils/types";
import Element = JSXInternal.Element;

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ad-auto-skipper.web.app"
    : "http://localhost:5000";

export function License({ user }: { user: AuthUser | null }): Element {
  return (
    <section class="license">
      <h1>{["Hi", user?.displayName?.split(" ")[0]].join(" ").trim()}!</h1>
      {!user?.email && (
        <>
          <p>
            I am a software developer. 2 cups of coffee ☕️ per year to unlock
            channel-level configuration.
          </p>
          <div class="license-btns">
            <a class="btn btn-primary" href={`${BASE_URL}/login.html?signup=1`}>
              Sign me up for $7/yr!
            </a>
          </div>
          <p>
            Do you already have a subscription?{" "}
            <a href={`${BASE_URL}/login.html`}>Apply it on this browser.</a>
          </p>
        </>
      )}
    </section>
  );
}
