import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { ChannelPrefForm } from "./channelPrefForm";

interface IChannelPrefProps {
  channelId: string;
  channelName: string;
  imageUrl: string;
  goHome: () => void;
}

export function ChannelPref({
  channelId,
  channelName,
  imageUrl,
  goHome,
}: IChannelPrefProps): Element {
  return (
    <>
      <div class={"channel-pref-header"}>
        <button class={"back-btn"} onClick={goHome}>
          &lt;
        </button>
        <h2 class={"legend"}>{channelName}</h2>
        <img className={"channel-logo"} src={imageUrl} alt={""} />
      </div>
      <ChannelPrefForm
        channelId={channelId}
        channelName={channelName}
        imageUrl={imageUrl}
      />
    </>
  );
}
