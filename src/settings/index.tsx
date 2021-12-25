import React, { useState } from "preact/compat";
import { render } from "preact";

import { License } from "./license";
import { ChannelPref } from "./channelPref";

function Settings() {
  const [page, setPage] = useState<"pref" | "configure-channel">("pref");

  return (
    <div class="container">
      <h1>Youtube Ad Auto-skipper</h1>

      {page === "pref" && (
        <>
          <License />
          <ChannelPref />
        </>
      )}
    </div>
  );
}

render(<Settings />, document.body);
