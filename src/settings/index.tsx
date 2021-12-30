import React, { useEffect, useState } from "preact/compat";
import { render } from "preact";

import { License } from "./license";
import { GlobalPref } from "./globalPref";
import { ChannelPref } from "./channelPref";

type PAGE = "pref" | "channel";

function useRoute() {
  const [page, setPage] = useState<PAGE>("pref");
  const [pageProps, setPageProps] = useState<Record<string, unknown>>({});

  useEffect(() => {
    (async () => {
      const { page, pageProps } = await chrome.storage.local.get([
        "page",
        "pageProps",
      ]);

      if (!page) {
        return;
      }

      // await chrome.storage.local.remove(["page", "pageProps"]);

      setPage(page);
      setPageProps(pageProps);
    })();
  }, []);

  const changePage = (page: PAGE, props?: Record<string, unknown>) => {
    setPage(page);
    setPageProps(props || {});
  };

  return { page, pageProps, changePage };
}

function Settings() {
  const { page, pageProps, changePage } = useRoute();

  return (
    <div class="container">
      <h1>Youtube Ad Auto-skipper</h1>

      {page === "pref" && (
        <>
          <License />
          <GlobalPref />
        </>
      )}

      {page === "channel" && (
        <ChannelPref
          goHome={() => changePage("pref")}
          channelId={pageProps.channelId as string}
          channelName={pageProps.channelName as string}
          imageUrl={pageProps.imageUrl as string}
        />
      )}
    </div>
  );
}

render(<Settings />, document.body);
