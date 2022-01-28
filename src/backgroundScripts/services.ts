import { logger } from "../utils/logger";
import { AuthUser, Subscription } from "../utils/types";
import {
  cancelSubscription,
  fetchSubscriptionForSession,
  fetchSubscriptionForUser,
  isSubscriptionActive,
} from "./api";

type CheckoutSession = {
  expireAt: number;
  sessionId: string;
  user: AuthUser;
};

function storeSubscription(sub: { subscriptionId: string }, user: AuthUser) {
  const subscription: Subscription = {
    ...sub,
    user,
    nextSyncAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  return chrome.storage.local.set({
    subscription,
  });
}

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
  const url = (() => {
    try {
      return new URL(tab.url || "");
    } catch {
      return null;
    }
  })();

  if (url?.href.includes("cancel=1")) {
    const res = await cancelSubscription(user.stsTokenManager.accessToken);

    if (res.success) {
      await chrome.storage.local.remove("subscription");
      chrome.runtime.openOptionsPage();
      await chrome.tabs.remove(tab.id as number);
    }

    return;
  }

  const res = await fetchSubscriptionForUser(user.stsTokenManager.accessToken);

  if ("subscribed" in res && res.subscribed) {
    await storeSubscription(res, user);

    chrome.runtime.openOptionsPage();
    await chrome.tabs.remove(tab.id as number);

    return;
  }

  if ("checkoutUrl" in res && res.checkoutUrl) {
    const checkoutSession: CheckoutSession = {
      expireAt: Date.now() + 24 * 60 * 60 * 1000, // expire in 24 hour
      sessionId: res.sessionId,
      user: user,
    };
    await chrome.storage.local.set({
      checkoutSession,
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
    const checkoutSession: CheckoutSession | null = await chrome.storage.local
      .get(["checkoutSession"])
      .then((data) => data.checkoutSession);

    if (!checkoutSession || checkoutSession.expireAt < Date.now()) {
      throw new Error();
    }

    const sub = await fetchSubscriptionForSession(checkoutSession.sessionId);

    if (sub.subscribed) {
      await storeSubscription(sub, checkoutSession.user);
      await chrome.storage.local.remove(["checkoutSession"]);
    }
  } catch (err) {
    logger.error(err);
  }

  chrome.runtime.openOptionsPage();
  await chrome.tabs.remove(tab.id as number);
}

export async function verifySubscription(): Promise<void> {
  const subscription: Subscription = await chrome.storage.local
    .get(["subscription"])
    .then((v) => v.subscription);

  logger.debug("Verifying subscription: ", subscription);

  if (!subscription) {
    return;
  }

  const { subscriptionId, nextSyncAt } = subscription;

  if (nextSyncAt > Date.now()) {
    return;
  }

  if (await isSubscriptionActive(subscriptionId)) {
    await storeSubscription(subscription, subscription.user);
    return;
  }

  await chrome.storage.local.remove("subscription");
}
