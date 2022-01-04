export type AuthUser = {
  displayName: string;
  email: string;
  stsTokenManager: {
    accessToken: string;
    refreshToken: string;
  };
};
