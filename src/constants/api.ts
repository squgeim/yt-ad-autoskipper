const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ad-auto-skipper.web.app"
    : "http://localhost:5002";

const AUTH_PAGE = `${BASE_URL}/login.html`;

export const API = {
  SIGNUP: `${AUTH_PAGE}?signup=1`,
  ACTIVATE: AUTH_PAGE,
  CANCEL: `${AUTH_PAGE}?cancel=1`,
};
