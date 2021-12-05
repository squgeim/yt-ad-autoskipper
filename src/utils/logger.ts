const __DEBUG__ = true;

function debug(...args: unknown[]): void {
  return __DEBUG__ && console.log("[yt-ad-skipper:debug]", ...args);
}

function error(...args: unknown[]): void {
  return __DEBUG__ && console.error("[yt-ad-skipper:error]", ...args);
}

export const logger = { debug, error };
