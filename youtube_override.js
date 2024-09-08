"use strict";

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

const skipButtonClasses = [
  "videoAdUiSkipButton",
  "ytp-ad-skip-button ytp-button",
  "ytp-ad-skip-button-modern ytp-button",
  "ytp-skip-ad-button",
];

const getEventHandler = (listener) =>
  function handleEvent(e) {
    const handler = {
      get(_, prop) {
        if (prop === "isTrusted") {
          return true;
        }
        if (typeof e[prop] === "function") {
          return function (...args) {
            return e[prop](...args);
          };
        }
        return e[prop];
      },
    };
    return listener(new Proxy({}, handler));
  };
function overrideAddEventListener() {
  const originalAddEventListener = HTMLElement.prototype.addEventListener;
  HTMLElement.prototype.addEventListener = function (type, listener, options) {
    if (type === "click" && skipButtonClasses.includes(this.className)) {
      return originalAddEventListener.call(
        this,
        type,
        getEventHandler(listener),
        options
      );
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}
if (!isInIframe()) {
  overrideAddEventListener();
}
