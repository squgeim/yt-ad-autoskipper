import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { ChannelPrefForm } from "./channelPrefForm";
import { useEffect, useState } from "preact/compat";
import { ChannelConfig, getConfig, removeChannel } from "../utils/config";

function useChannelsList() {
  const [channels, setChannels] = useState<ChannelConfig[]>([]);

  useEffect(() => {
    const syncChannels = () => {
      getConfig().then((config) => {
        setChannels(
          Object.values(config.channelConfigs).sort((a, b) =>
            a.channelName.localeCompare(b.channelName)
          )
        );
      });
    };

    syncChannels();

    const handleChange = (changes: Record<string, unknown>) => {
      if ("config" in changes) {
        syncChannels();
      }
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, []);

  return channels;
}

type GlobalPrefProps = {
  configureChannel: (channel: ChannelConfig) => void;
};

export function GlobalPref(props: GlobalPrefProps): Element {
  const channels = useChannelsList();

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
        <ul class="pref-box">
          {channels.map((channel) => (
            <li
              class="pref-row channel-row"
              onClick={() => {
                props.configureChannel(channel);
              }}
            >
              <img src={channel.imageUrl} alt="" />
              <a class="label" href="#">
                {channel.channelName}
              </a>
              <button
                class="remove-channel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeChannel(channel.channelId);
                }}
                title="Remove channel configuration"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
