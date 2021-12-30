import React, { useEffect, useRef, useState } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import {
  createChannel,
  DEFAULT_CONFIG,
  getChannelConfig,
  getShouldMuteAd,
  getTimeToSkipAdOffset,
  setMuteAd,
  setTimeToSkipAdOffset,
} from "../utils/config";
import TargetedEvent = JSXInternal.TargetedEvent;

interface IChannelPrefProps {
  channelId: string;
  channelName: string;
  imageUrl: string;
  goHome: () => void;
}

function useConfig(
  channelId: string,
  channelName: string,
  channelImageUrl: string
) {
  const shouldCreateChannel = useRef(false);
  const [isMute, setIsMute] = useState(false);
  const [skipSecs, setSkipSecs] = useState(0);

  useEffect(() => {
    getChannelConfig(channelId).then((config) => {
      if (!config) {
        setSkipSecs(DEFAULT_CONFIG.globalConfig.timeToSkip);
        setIsMute(DEFAULT_CONFIG.globalConfig.muteAd);
        shouldCreateChannel.current = true;

        return;
      }

      setSkipSecs(config.timeToSkip);
      setIsMute(config.muteAd);
    });
  }, []);

  const createChannelIfRequired = async () => {
    if (shouldCreateChannel.current) {
      await createChannel(channelId, channelName, channelImageUrl);
    }
  };

  const updateSkipSecs = (e: TargetedEvent) => {
    const input = e.target as HTMLInputElement;
    const val = +input.value;

    if (isNaN(val)) {
      input.value = "" + skipSecs;

      return;
    }

    input.value = "" + val;

    createChannelIfRequired()
      .then(() => setTimeToSkipAdOffset(channelId, val))
      .then((newVal) => setSkipSecs(newVal))
      .catch(() => getTimeToSkipAdOffset().then((s) => setSkipSecs(s)));
  };

  const toggleIsMute = () => {
    createChannelIfRequired()
      .then(() => setMuteAd(channelId, !isMute))
      .then((newVal) => setIsMute(newVal))
      .catch(() => getShouldMuteAd().then((m) => setIsMute(m)));
  };

  return {
    isMute,
    skipSecs,
    updateSkipSecs,
    toggleIsMute,
  };
}

export function ChannelPref({
  channelId,
  channelName,
  imageUrl,
  goHome,
}: IChannelPrefProps): Element {
  const { isMute, skipSecs, updateSkipSecs, toggleIsMute } = useConfig(
    channelId,
    channelName,
    imageUrl
  );

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
            <input type={"checkbox"} checked={isMute} onChange={toggleIsMute} />
          </label>

          <label>
            <span>Seconds to play ad before skipping.</span>
            <input type={"number"} value={skipSecs} onChange={updateSkipSecs} />
          </label>
        </fieldset>
      </form>
    </>
  );
}
