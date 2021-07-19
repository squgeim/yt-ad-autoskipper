const __DEBUG__ = true;

function debug(...args: unknown[]): void {
  return __DEBUG__ && console.log("[yt-ad-skipper:debug]", ...args);
}

export const logger = { debug };
