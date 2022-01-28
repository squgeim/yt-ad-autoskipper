import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { ChannelPrefForm } from "./channelPrefForm";
import { GO_PREF_HOME } from "../constants/actions";
import { useEffect } from "preact/hooks";

interface IChannelPrefProps {
  channelId: string;
  channelName: string;
  imageUrl: string;
  isDisabled: boolean;
}

export function ChannelPref({
  channelId,
  channelName,
  imageUrl,
  isDisabled,
}: IChannelPrefProps): Element {
  useEffect(() => {
    if (isDisabled) {
      chrome.runtime.sendMessage({
        type: GO_PREF_HOME,
      });
    }
  }, [isDisabled]);

  return (
    <>
      <div class={"channel-pref-header"}>
        <button
          class={"back-btn"}
          onClick={() => {
            chrome.runtime.sendMessage({
              type: GO_PREF_HOME,
            });
          }}
        >
          &lt;
        </button>
        <h2 class={"channel-pref-title"}>{channelName}</h2>
        <img className={"channel-logo"} src={imageUrl} alt={""} />
      </div>
      <ChannelPrefForm
        channelId={channelId}
        channelName={channelName}
        imageUrl={imageUrl}
        isDisabled={isDisabled}
      />
    </>
  );
}
