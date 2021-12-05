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

class Config extends EventTarget {
  #config = Config.DEFAULT_CONFIG;

  static #singleton?: Config;
  static DEFAULT_CONFIG: ConfigObj = {
    email: "",
    licenseKey: "",
    globalConfig: {
      timeToSkip: AD_PLAYBACK_OFFSET,
      muteAd: false,
    },
    channelConfigs: {},
  };

  #isReady = false;

  get isReady() {
    return this.#isReady;
  }

  constructor() {
    super();

    this.#sync();
    chrome.storage.onChanged.addListener((changed, area) => {
      if (area !== "local" || !("config" in changed)) {
        return;
      }

      this.#sync();
    });
  }

  static get instance() {
    if (!this.#singleton) {
      this.#singleton = new Config();
    }

    return this.#singleton;
  }

  get currentConfig() {
    return this.#config;
  }

  #sync() {
    this.#getConfig().then((c) => {
      this.#config = c ?? this.#config;
      this.#isReady = true;
      this.dispatchEvent(new Event("update"));
      console.log("HERE", this.#config);
    });
  }

  #getConfig(): Promise<ConfigObj> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["config"], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        resolve(result.config);
      });
    });
  }

  #setConfig(config: ConfigObj): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ config }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        resolve();
      });
    });
  }

  async setConfigValue(
    channelUrl: string,
    value: Partial<ChannelConfig>
  ): Promise<void>;
  async setConfigValue(value: Partial<ChannelConfig>): Promise<void>;
  async setConfigValue(
    valueOrChannelUrl: string | Partial<ChannelConfig>,
    value?: Partial<ChannelConfig>
  ): Promise<void> {
    if (isChannelConfig(valueOrChannelUrl)) {
      this.#config.globalConfig = {
        ...this.#config.globalConfig,
        ...valueOrChannelUrl,
      };

      return;
    }

    const channelConfig = this.#config.channelConfigs[valueOrChannelUrl];

    if (!channelConfig || !isChannelConfig(value)) {
      return;
    }

    this.#config.channelConfigs[valueOrChannelUrl] = {
      ...channelConfig,
      ...value,
    };

    return this.#setConfig(this.#config);
  }
}

const config = Config.instance;

function isChannelConfig(val: any): val is Partial<ChannelConfig> {
  return val && ("timeToSkip" in val || "muteAd" in val);
}

/**
 * Returns the number of milliseconds that an ad should be played for given
 * channel.
 *
 * 0 for immediately, -1 for don't skip.
 */
function getTimeToSkipAdOffset(channelUrl?: string): number {
  if (channelUrl && channelUrl in config.currentConfig.channelConfigs) {
    return config.currentConfig.channelConfigs[channelUrl].timeToSkip;
  }

  console.log(config?.currentConfig);

  return config.currentConfig.globalConfig.timeToSkip;
}

export { getTimeToSkipAdOffset, config };
