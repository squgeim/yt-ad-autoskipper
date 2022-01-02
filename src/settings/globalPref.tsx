import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { ChannelPrefForm } from "./channelPrefForm";
import { ChannelsList } from "./channelsList";

export function GlobalPref(): Element {
  return (
    <>
      <div>
        <h2 class="title">
          Global Preferences
          <p class="pref-desc">
            These preferences will be used for all videos unless there is a
            specific configuration for a YouTube channel defined below.
          </p>
        </h2>
        <ChannelPrefForm />
      </div>
      <div>
        <h2 class="title">
          Channel Preferences
          <p class="pref-desc">
            You can configure Ad-Skipper to have a different behavior in videos
            by your favourite YouTubers.
          </p>
        </h2>
        <ChannelsList />
      </div>
    </>
  );
}
