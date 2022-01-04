import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import { logger } from "../utils/logger";
import { AuthUser } from "../utils/types";
import Element = JSXInternal.Element;

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ad-auto-skipper.web.app"
    : "http://localhost:5000";

function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const getUserFromStorage = async () => {
    const { subscription } = await chrome.storage.local.get(["subscription"]);

    logger.debug("subscription", subscription);

    setUser(subscription?.user || {});
  };

  useEffect(() => {
    getUserFromStorage();
  }, []);

  return user;
}

export function License(): Element {
  const user = useUser();

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
