export type AuthUser = {
  displayName: string;
  email: string;
  stsTokenManager: {
    accessToken: string;
    refreshToken: string;
  };
};

export type Subscription = {
  subscriptionId: string;
  user: AuthUser;
  nextSyncAt: number;
};

export interface EventHandler {
  setupListeners: () => void;
}
