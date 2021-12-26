import React from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;

interface IChannelPrefProps {
  channelId: string;
  goHome: () => void;
}

export function ChannelPref({ channelId, goHome }: IChannelPrefProps): Element {
  return (
    <>
      <button onClick={goHome}>Back</button>
      <div>Channel pref for {channelId}</div>
    </>
  );
}
