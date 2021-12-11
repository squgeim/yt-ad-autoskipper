const __DEBUG__ = true;

function debug(...args: unknown[]): void {
  return __DEBUG__ && console.log("[yt-ad-skipper:debug]", ...args);
}

function error(...args: unknown[]): void {
  return console.error("[yt-ad-skipper:error]", ...args);
}

function warn(...args: unknown[]): void {
  return console.warn("[yt-ad-skipper:warn]", ...args);
}

export const logger = { debug, error, warn };
