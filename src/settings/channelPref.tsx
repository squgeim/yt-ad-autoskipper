import React, { useEffect, useState } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { getTimeToSkipAdOffset, setTimeToSkipAdOffset } from "../utils/config";

export function ChannelPref(): Element {
  // const [isMute, setIsMute] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [skipSecs, setSkipSecs] = useState(0);

  useEffect(() => {
    Promise.all([getTimeToSkipAdOffset()]).then(([s]) => {
      setSkipSecs(s);
      setSettingsReady(true);
    });
  }, []);

  const updateSkipSecs = (val: number) => {
    setTimeToSkipAdOffset("global", val)
      .then((newVal) => setSkipSecs(newVal))
      .catch(() => getTimeToSkipAdOffset().then((s) => setSkipSecs(s)));
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

        {/*<label>*/}
        {/*  <input*/}
        {/*    type={"checkbox"}*/}
        {/*    checked={isMute}*/}
        {/*    onChange={() => {*/}
        {/*      setIsMute((v) => !v);*/}
        {/*    }}*/}
        {/*  />*/}
        {/*  <span>Mute Ads.</span>*/}
        {/*</label>*/}

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
      {/*<fieldset>*/}
      {/*  <legend>*/}
      {/*    <h2 class="legend">Channel Preferences</h2>*/}
      {/*  </legend>*/}

      {/*  <p>You can customize the extension for your favorite Youtubers.</p>*/}

      {/*  <input*/}
      {/*    type="text"*/}
      {/*    title="Filter Channels"*/}
      {/*    placeholder="Filter Channels"*/}
      {/*  />*/}
      {/*  <div class="channel-btns">*/}
      {/*    <button>+</button>*/}
      {/*  </div>*/}
      {/*</fieldset>*/}
    </>
  );
}
