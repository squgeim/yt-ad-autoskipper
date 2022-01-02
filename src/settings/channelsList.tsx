import { useEffect, useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import { CONFIGURE_CHANNEL } from "../constants/actions";
import { ChannelConfig, getConfig, removeChannel } from "../utils/config";
import Element = JSXInternal.Element;

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

export function ChannelsList(): Element {
  const channels = useChannelsList();

  return (
    <ul class="pref-box">
      {channels.map((channel) => (
        <li
          class="pref-row channel-row"
          onClick={() => {
            //props.configureChannel(channel);
            chrome.runtime.sendMessage({
              type: CONFIGURE_CHANNEL,
              channel: channel,
            });
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
  );
}
