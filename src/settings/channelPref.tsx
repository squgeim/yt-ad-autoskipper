import React, { useEffect, useState } from "preact/compat";
import { JSXInternal } from "preact/src/jsx";
import Element = JSXInternal.Element;
import { getTimeToSkipAdOffset, config } from "../utils/config";
import { logger } from "../utils/logger";

export function ChannelPref(): Element {
  // const [isMute, setIsMute] = useState(false);
  const [skipSecs, setSkipSecs] = useState(0);

  const updateSkipSecs = (val: number) => {
    if (!config?.isReady) return;

    const prevValue = skipSecs;
    config
      .setConfigValue({
        timeToSkip: val,
      })
      .catch((err) => {
        setSkipSecs(prevValue);
        logger.error(err);
      });
  };

  useEffect(() => {
    const updateVal = () => {
      logger.debug("updating value");
      setSkipSecs(getTimeToSkipAdOffset());
    };

    config?.addEventListener("update", updateVal);

    return () => {
      config?.removeEventListener("update", updateVal);
    };
  });

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
