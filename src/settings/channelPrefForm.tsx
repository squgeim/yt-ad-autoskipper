import { useEffect, useRef, useState } from "preact/compat";
import {
  createChannel,
  DEFAULT_CONFIG,
  getChannelConfig,
  getShouldMuteAd,
  getTimeToSkipAdOffset,
  setShouldMuteAd,
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
      .then(() => setShouldMuteAd(channelId || "global", !isMute))
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
          <div class="label">
            <span>Mute Ads</span>
            <p class="pref-desc">Ads will be muted when they start playing.</p>
          </div>
          <input type={"checkbox"} checked={isMute} onChange={toggleIsMute} />
        </label>

        <label class="pref-row">
          <div class="label">
            <span>Seconds to play ad before skipping</span>
            <p class="pref-desc">
              Ads will play for the supplied number of seconds before they are
              skiped. The default value is 5 seconds as that is when YouTube
              makes the "Skip Ad" button visible, but the value can be as low as
              0, where you won't see any ads.
            </p>
            <p class="pref-desc">
              You can let ads play longer for you favorite YouTubers and skip
              them quickly for other videos.
            </p>
          </div>
          <input type={"number"} value={skipSecs} onChange={updateSkipSecs} />
        </label>
      </fieldset>
    </form>
  );
}
