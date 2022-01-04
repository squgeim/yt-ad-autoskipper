import { logger } from "../utils/logger";
import { AuthUser } from "../utils/types";
import { fetchSubscriptionForSession, fetchSubscriptionForUser } from "./api";

export function configureChannel({
  channelId,
  channelName,
  imageUrl,
}: {
  channelId: string;
  channelName: string;
  imageUrl: string;
}): void {
  logger.debug("ChannelId: ", channelId);
  chrome.storage.local
    .set({
      page: `channel`,
      pageProps: {
        channelId,
        channelName,
        imageUrl,
      },
    })
    .then(() => {
      chrome.runtime.openOptionsPage();
    });
}

export function goPrefHome(): void {
  logger.debug("Going home");
  chrome.storage.local
    .set({
      page: `pref`,
      pageProps: {},
    })
    .then(() => {
      return chrome.runtime.openOptionsPage();
    });
}

export async function loginSuccess(
  user: AuthUser,
  tab: chrome.tabs.Tab
): Promise<void> {
  const res = await fetchSubscriptionForUser(user.stsTokenManager.accessToken);

  if ("subscribed" in res && res.subscribed) {
    await chrome.storage.local.set({
      subscription: {
        user,
        ...res,
      },
    });

    chrome.runtime.openOptionsPage();
    await chrome.tabs.remove(tab.id as number);

    return;
  }

  if ("checkoutUrl" in res && res.checkoutUrl) {
    await chrome.storage.local.set({
      checkoutSession: {
        expireAt: Date.now() + 24 * 60 * 60 * 1000, // expire in 24 hour
        sessionId: res.sessionId,
        user: user,
      },
    });
    await chrome.tabs.update(tab.id as number, {
      url: res.checkoutUrl,
    });

    return;
  }

  chrome.runtime.openOptionsPage();
  await chrome.tabs.remove(tab.id as number);
}

export async function completeCheckout(
  success: boolean,
  tab: chrome.tabs.Tab
): Promise<void> {
  if (!success) {
    chrome.runtime.openOptionsPage();
    await chrome.tabs.remove(tab.id as number);

    return;
  }

  try {
    const { checkoutSession } = await chrome.storage.local.get([
      "checkoutSession",
    ]);

    if (!checkoutSession || checkoutSession.expireAt < Date.now()) {
      throw new Error();
    }

    const sub = await fetchSubscriptionForSession(checkoutSession.sessionId);

    if (sub.subscribed) {
      await chrome.storage.local.set({
        subscription: {
          user: checkoutSession.user,
          ...sub,
        },
      });
      await chrome.storage.local.remove(["checkoutSession"]);
    }
  } catch (err) {
    logger.error(err);
  }

  chrome.runtime.openOptionsPage();
  await chrome.tabs.remove(tab.id as number);
}
