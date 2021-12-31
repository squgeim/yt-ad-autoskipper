import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { ChannelPrefForm } from "./channelPrefForm";
import { useEffect, useState } from "preact/compat";
import { ChannelConfig, getConfig } from "../utils/config";

function useChannelsList() {
  const [channels, setChannels] = useState<ChannelConfig[]>([]);

  useEffect(() => {
    getConfig().then((config) => {
      setChannels(Object.values(config.channelConfigs));
    });
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
      <ChannelPrefForm />
      <div>
        <h2 class="legend">Channel Preferences</h2>
        <ul class="pref-box">
          {channels.map((channel) => (
            <li
              class="pref-row channel-row"
              onClick={() => {
                props.configureChannel(channel);
              }}
            >
              <img src={channel.imageUrl} />
              <a class="label" href="#">
                {channel.channelName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
