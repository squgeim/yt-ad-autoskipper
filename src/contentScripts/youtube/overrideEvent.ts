import { isInIframe } from "../../utils/dom";
import { skipButtonClasses } from "../../utils/youtubeDOM";

type Callable = <T>(args: T) => unknown;

const getEventHandler = (listener: Callable) =>
  function handleEvent(e: any) {
    const handler = {
      get(_: unknown, prop: string) {
        if (prop === "isTrusted") {
          return true;
        }

        if (typeof e[prop] === "function") {
          return function (...args: unknown[]) {
            // Implement your dynamic logic for method calls
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

  HTMLElement.prototype.addEventListener = function (
    type: string,
    listener: Callable,
    options?: boolean | AddEventListenerOptions | undefined
  ) {
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
