import React, { useEffect, useRef, useState } from "preact/compat";
import {
  createChannel,
  DEFAULT_CONFIG,
  getChannelConfig,
  getShouldMuteAd,
  getTimeToSkipAdOffset,
  setMuteAd,
  setTimeToSkipAdOffset,
} from "../utils/config";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import TargetedEvent = JSXInternal.TargetedEvent;

function useConfig(
  channelId?: string,
  channelName?: string,
  channelImageUrl?: string
) {
  const shouldCreateChannel = useRef(false);
  const [isMute, setIsMute] = useState(false);
  const [skipSecs, setSkipSecs] = useState(0);

  useEffect(() => {
    getChannelConfig(channelId || "global").then((config) => {
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
    if (
      shouldCreateChannel.current &&
      channelId &&
      channelName &&
      channelImageUrl
    ) {
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
      .then(() => setTimeToSkipAdOffset(channelId || "global", val))
      .then((newVal) => setSkipSecs(newVal))
      .catch(() => getTimeToSkipAdOffset().then((s) => setSkipSecs(s)));
  };

  const toggleIsMute = () => {
    createChannelIfRequired()
      .then(() => setMuteAd(channelId || "global", !isMute))
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

type ChannelPrefFormProps = {
  channelId?: string;
  channelName?: string;
  imageUrl?: string;
};

export function ChannelPrefForm({
  channelId,
  channelName,
  imageUrl,
}: ChannelPrefFormProps): Element {
  const { isMute, skipSecs, toggleIsMute, updateSkipSecs } = useConfig(
    channelId,
    channelName,
    imageUrl
  );

  return (
    <form>
      <fieldset class={"pref-box"}>
        <label class="pref-row">
          <span class="label">Mute Ads.</span>
          <input type={"checkbox"} checked={isMute} onChange={toggleIsMute} />
        </label>

        <label class="pref-row">
          <span class="label">Seconds to play ad before skipping.</span>
          <input type={"number"} value={skipSecs} onChange={updateSkipSecs} />
        </label>
      </fieldset>
    </form>
  );
}
