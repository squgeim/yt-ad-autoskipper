import React, { useEffect, useState } from "preact/compat";
import { render } from "preact";

import { License } from "./license";
import { GlobalPref } from "./globalPref";
import { ChannelPref } from "./channelPref";
import { logger } from "../utils/logger";
import { AuthUser } from "../utils/types";
import { getSubscription } from "../utils/config";

type PAGE = "pref" | "channel";

function useRoute() {
  const [page, setPage] = useState<PAGE>("pref");
  const [pageProps, setPageProps] = useState<Record<string, unknown>>({});

  const handlePageChange = async () => {
    const { page, pageProps } = await chrome.storage.local.get([
      "page",
      "pageProps",
    ]);

    if (!page) {
      return;
    }

    await chrome.storage.local.remove(["page", "pageProps"]);

    setPage(page);
    setPageProps(pageProps);
  };

  useEffect(() => {
    handlePageChange();
  }, []);

  useEffect(() => {
    const handleMessage = (changes: Record<string, unknown>) => {
      if ("page" in changes) {
        handlePageChange();
      }
    };

    chrome.storage.onChanged.addListener(handleMessage);

    return () => chrome.storage.onChanged.removeListener(handleMessage);
  }, []);

  return { page, pageProps };
}

function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const getUserFromStorage = async () => {
    const subscription = await getSubscription();

    logger.debug("subscription", subscription);

    setUser(subscription?.user || null);
  };

  useEffect(() => {
    getUserFromStorage();
  }, []);

  return user;
}

function Settings() {
  const user = useUser();
  const { page, pageProps } = useRoute();

  return (
    <div class="container" key={page}>
      <h1>Youtube Ad Auto-skipper</h1>

      {page === "pref" && (
        <>
          <License user={user} />
          <GlobalPref isDisabled={!user} />
        </>
      )}

      {page === "channel" && (
        <ChannelPref
          isDisabled={!user}
          channelId={pageProps.channelId as string}
          channelName={pageProps.channelName as string}
          imageUrl={pageProps.imageUrl as string}
        />
      )}
    </div>
  );
}

render(<Settings />, document.body);
