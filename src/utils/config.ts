import merge from "deepmerge";
import { logger } from "./logger";

import { AD_PLAYBACK_OFFSET } from "../constants/youtube";

type TimeToSkipConfig = {
  timeToSkip: number;
};

type MuteAdConfig = {
  muteAd: boolean;
};

type BaseConfig = TimeToSkipConfig & MuteAdConfig;

export type ChannelConfig = {
  channelName: string;
  channelId: string;
  imageUrl: string;
} & BaseConfig;

export type ConfigObj = {
  email: string;
  licenseKey: string;
  globalConfig: BaseConfig;
  channelConfigs: Record<string, ChannelConfig>;
};

type Scope = "global" | string;

export const DEFAULT_CONFIG: ConfigObj = Object.freeze({
  email: "",
  licenseKey: "",
  globalConfig: {
    timeToSkip: AD_PLAYBACK_OFFSET,
    muteAd: false,
  },
  channelConfigs: {},
});

export function getConfig(): Promise<ConfigObj> {
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

async function mergeChannelConfig(
  scope: Scope,
  addition: TimeToSkipConfig | MuteAdConfig
) {
  const currentConfig = await getConfig();

  if (scope === "global") {
    const newConfig: ConfigObj = {
      ...currentConfig,
      globalConfig: merge<ChannelConfig>(currentConfig.globalConfig, addition),
    };

    await setConfig(newConfig);

    return;
  }

  if (!(scope in currentConfig.channelConfigs)) {
    logger.warn("Channel has not been created yet. This should not happen.");

    return;
  }

  const newConfig: ConfigObj = {
    ...currentConfig,
    channelConfigs: {
      ...currentConfig.channelConfigs,
      [scope]: merge<ChannelConfig>(
        currentConfig.channelConfigs[scope],
        addition
      ),
    },
  };

  await setConfig(newConfig);
}

export async function getTimeToSkipAdOffset(
  channelId?: string
): Promise<number> {
  const config = await getConfig();

  logger.debug("getTimeToSkipOffset: ", config);

  if (channelId && channelId in config.channelConfigs) {
    return config.channelConfigs[channelId].timeToSkip;
  }

  return config.globalConfig.timeToSkip;
}

export async function setTimeToSkipAdOffset(
  scope: Scope,
  value: number
): Promise<number> {
  const configAddition = {
    timeToSkip: value,
  };

  await mergeChannelConfig(scope, configAddition);

  return await getTimeToSkipAdOffset();
}

export async function getShouldMuteAd(channelId?: string): Promise<boolean> {
  const config = await getConfig();

  logger.debug("getIsMute: ", config);

  if (channelId && channelId in config.channelConfigs) {
    return config.channelConfigs[channelId].muteAd;
  }

  return config.globalConfig.muteAd;
}

export async function setMuteAd(
  scope: Scope,
  value: boolean
): Promise<boolean> {
  const configAddition = {
    muteAd: value,
  };

  await mergeChannelConfig(scope, configAddition);

  return getShouldMuteAd();
}

export async function getChannelConfig(
  channelId: string
): Promise<ChannelConfig | undefined> {
  const currentConfig = await getConfig();

  return currentConfig.channelConfigs[channelId];
}

export async function createChannel(
  channelId: string,
  channelName: string,
  imageUrl: string
): Promise<ConfigObj> {
  const currentConfig = await getConfig();

  const newConfig: ConfigObj = {
    ...currentConfig,
    channelConfigs: {
      ...currentConfig.channelConfigs,
      [channelId]: {
        channelId,
        channelName,
        imageUrl,
        timeToSkip: DEFAULT_CONFIG.globalConfig.timeToSkip,
        muteAd: DEFAULT_CONFIG.globalConfig.muteAd,
      },
    },
  };

  await setConfig(newConfig);

  return newConfig;
}
