import merge from "deepmerge";
import { logger } from "./logger";

import { AD_PLAYBACK_OFFSET } from "../constants/youtube";

type ChannelConfig = {
  timeToSkip: number;
  muteAd: boolean;
};

type ConfigObj = {
  email: string;
  licenseKey: string;
  globalConfig: ChannelConfig;
  channelConfigs: Record<string, ChannelConfig>;
};

const DEFAULT_CONFIG: ConfigObj = Object.freeze({
  email: "",
  licenseKey: "",
  globalConfig: {
    timeToSkip: AD_PLAYBACK_OFFSET,
    muteAd: false,
  },
  channelConfigs: {},
});

function getConfig(): Promise<ConfigObj> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["config"], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      if (!result.config) {
        resolve(DEFAULT_CONFIG);
      }

      resolve(result.config);
    });
  });
}

function setConfig(config: ConfigObj): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ config }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(undefined);
    });
  });
}

export async function getTimeToSkipAdOffset(
  channelUrl?: string
): Promise<number> {
  const config = await getConfig();

  logger.debug("getTimeToSkipOffset: ", config);

  if (channelUrl && channelUrl in config.channelConfigs) {
    return config.channelConfigs[channelUrl].timeToSkip;
  }

  return config.globalConfig.timeToSkip;
}

export async function setTimeToSkipAdOffset(
  scope: "global" | string,
  value: number
): Promise<number> {
  const currentConfig = await getConfig();
  let newConfig: ConfigObj;

  const configAddition = {
    timeToSkip: value,
  };

  if (scope === "global") {
    newConfig = {
      ...currentConfig,
      globalConfig: merge<ChannelConfig>(
        currentConfig.globalConfig,
        configAddition
      ),
    };

    return setConfig(newConfig).then(() => getTimeToSkipAdOffset());
  }

  logger.warn("Channel config has not been implemented yet.");

  return await getTimeToSkipAdOffset();
}
