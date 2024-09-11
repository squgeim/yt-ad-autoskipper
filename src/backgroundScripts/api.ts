import { logger } from "../utils/logger";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ad-auto-skipper.web.app"
    : "http://localhost:5002";

export async function fetchSubscriptionForUser(
  token: string
): Promise<
  | { subscribed: boolean; subscriptionId: string; customerId: string }
  | { checkoutUrl: string; sessionId: string }
> {
  const res = await fetch(`${BASE_URL}/fns/v1/fetch_subscription_checkout`, {
    headers: {
      token,
    },
  }).then((res) => res.json());

  logger.debug("fetch for user: ", res);

  if ("checkoutUrl" in res) {
    return {
      checkoutUrl: res.checkoutUrl,
      sessionId: res.sessionId,
    };
  }

  return res;
}

export async function fetchSubscriptionForSession(sessionId: string): Promise<{
  subscribed: boolean;
  subscriptionId: string;
  customerId: string;
}> {
  const res = await fetch(
    `${BASE_URL}/fns/v1/fetch_subscription_by_session/${sessionId}`
  ).then((res) => res.json());

  logger.debug("fetch for session: ", res);

  if ("subscribed" in res) {
    return res;
  }

  logger.error(res.error);

  throw new Error(res.error?.message);
}

export async function isSubscriptionActive(
  subscriptionId: string
): Promise<boolean> {
  const res = await fetch(
    `${BASE_URL}/fns/v1/fetch_subscription/${subscriptionId}`
  ).then((res) => res.json());

  logger.debug("fetch subscription: ", res);

  if ("subscribed" in res && res.subscribed) {
    return true;
  }

  return false;
}

export async function cancelSubscription(
  token: string
): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/fns/v1/cancel_subscription`, {
    method: "POST",
    headers: {
      token,
    },
  }).then((res) => res.json());

  logger.debug("cancel subscription: ", res);

  return res;
}
