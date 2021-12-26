import React, { useEffect, useState } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import {
  getShouldMuteAd,
  getTimeToSkipAdOffset,
  setMuteAd,
  setTimeToSkipAdOffset,
} from "../utils/config";

export function GlobalPref(): Element {
  const [isMute, setIsMute] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [skipSecs, setSkipSecs] = useState(0);

  useEffect(() => {
    Promise.all([getTimeToSkipAdOffset(), getShouldMuteAd()]).then(([s, m]) => {
      setSkipSecs(s);
      setIsMute(m);
      setSettingsReady(true);
    });
  }, []);

  const updateSkipSecs = (val: number) => {
    setTimeToSkipAdOffset("global", val)
      .then((newVal) => setSkipSecs(newVal))
      .catch(() => getTimeToSkipAdOffset().then((s) => setSkipSecs(s)));
  };

  const updateIsMute = (val: boolean) => {
    setMuteAd("global", val)
      .then((newVal) => setIsMute(newVal))
      .catch(() => getShouldMuteAd().then((m) => setIsMute(m)));
  };

  if (!settingsReady) {
    return <></>;
  }

  return (
    <>
      <fieldset class="pref-box">
        <legend>
          <h2 class="legend">Default Preferences</h2>
        </legend>

        <label>
          <input
            type={"checkbox"}
            checked={isMute}
            onChange={() => {
              updateIsMute(!isMute);
            }}
          />
          <span>Mute Ads.</span>
        </label>

        <label>
          <input
            type={"number"}
            value={skipSecs}
            onChange={(e) => {
              const input = e.target as HTMLInputElement;
              const val = +input.value;

              if (isNaN(val)) {
                input.value = "" + skipSecs;

                return;
              }

              input.value = "" + val;
              updateSkipSecs(val);
            }}
          />
          <span>Skips ads after it has played for seconds.</span>
        </label>
      </fieldset>
      <fieldset>
        <legend>
          <h2 class="legend">Channel Preferences</h2>
        </legend>

        <p>You can customize the extension for your favorite Youtubers.</p>

        <input
          type="text"
          title="Filter Channels"
          placeholder="Filter Channels"
        />
        <div class="channel-btns">
          <button>+</button>
        </div>
      </fieldset>
    </>
  );
}
