import { deepmerge } from "./helpers";
import { logger } from "./logger";

import { Subscription } from "./types";

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
  globalConfig: BaseConfig;
  channelConfigs: Record<string, ChannelConfig>;
};

type Scope = "global" | string;

// Seconds after with Skip Ad button is activated by default.
const AD_PLAYBACK_OFFSET = 5;
export const DEFAULT_CONFIG: ConfigObj = Object.freeze({
  globalConfig: {
    timeToSkip: AD_PLAYBACK_OFFSET,
    muteAd: false,
  },
  channelConfigs: {},
});

export async function getSubscription(): Promise<Subscription | null> {
  const { subscription } = await chrome.storage.local.get(["subscription"]);

  return subscription;
}

export async function getConfig(): Promise<ConfigObj> {
  const { config, subscription } = await chrome.storage.local.get([
    "config",
    "subscription",
  ]);

  if (!config || !subscription?.subscriptionId) {
    return DEFAULT_CONFIG;
  }

  return config;
}

async function setConfig(config: ConfigObj): Promise<void> {
  const subscription = await getSubscription();

  if (!subscription?.subscriptionId) {
    logger.debug("not setting config because user does not have subscription.");
    return;
  }

  return await chrome.storage.local.set({ config });
}

async function mergeChannelConfig(
  scope: Scope,
  addition: TimeToSkipConfig | MuteAdConfig
) {
  const currentConfig = await getConfig();

  if (scope === "global") {
    const newConfig: ConfigObj = {
      ...currentConfig,
      globalConfig: deepmerge<ChannelConfig>(
        currentConfig.globalConfig,
        addition
      ),
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
      [scope]: deepmerge<ChannelConfig>(
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

export async function setShouldMuteAd(
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
  channelId: Scope
): Promise<ChannelConfig | BaseConfig | undefined> {
  const currentConfig = await getConfig();

  if (channelId === "global") {
    return currentConfig.globalConfig;
  }

  return currentConfig.channelConfigs[channelId];
}

export async function createChannel(
  channelId: string,
  channelName: string,
  imageUrl: string
): Promise<void> {
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
}

export async function removeChannel(channelId: string): Promise<void> {
  const currentConfig = await getConfig();

  const newChannelConfig = Object.fromEntries(
    Object.entries(currentConfig.channelConfigs).filter(
      ([id]) => id !== channelId
    )
  );

  const newConfig = {
    ...currentConfig,
    channelConfigs: newChannelConfig,
  };

  await setConfig(newConfig);
}
