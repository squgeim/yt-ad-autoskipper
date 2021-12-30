import React from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;

interface IChannelPrefProps {
  channelId: string;
  channelName: string;
  imageUrl: string;
  goHome: () => void;
}

export function ChannelPref({
  // channelId,
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

      <form>
        <fieldset class={"pref-box"}>
          <label>
            <span>Mute Ads.</span>
            <input type={"checkbox"} checked={false} />
          </label>

          <label>
            <span>Seconds to play ad before skipping.</span>
            <input type={"number"} value={5} />
          </label>
        </fieldset>
      </form>
    </>
  );
}
