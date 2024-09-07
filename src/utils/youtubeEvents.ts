import { mainLoop } from "./helpers";
import { logger } from "./logger";

export enum Events {
  tick = "tick",
  adPlayStarted = "adPlayStarted",
  adChanged = "adChanged",
  adPlayEnded = "adPlayEnded",
  locationChanged = "locationChanged",
}

const EventNames = Object.keys(Events);

type Callback = (
  prev: { ad: string | undefined; location: string },
  next: { ad: string | undefined; location: string }
) => void;

const callbacks: Record<string, Callback[]> = EventNames.reduce(
  (acc, evt) => ({ ...acc, [evt]: [] }),
  {}
);

const startMainLoop = () => {
  let currentAd: string | undefined;
  let currentLoc = document.location.href;

  mainLoop(async () => {
    const nextLoc = document.location.href;
    const adPlaying =
      document
        .querySelector(".ytp-ad-visit-advertiser-button")
        ?.getAttribute("aria-label") ??
      document.querySelector(".ytp-ad-badge")?.textContent ??
      undefined;
    const eventsToCall: Events[] = [];
    const cbArg = [
      { ad: currentAd, location: currentLoc },
      { ad: adPlaying, location: nextLoc },
    ] as const;

    if (currentLoc !== nextLoc) {
      // location has changed.
      eventsToCall.push(Events.locationChanged);
      currentLoc = nextLoc;
    }

    if (currentAd !== adPlaying) {
      if (adPlaying) {
        // a new ad has started;
        eventsToCall.push(Events.adPlayStarted);
      }

      if (currentAd && adPlaying) {
        // ad has changed;
        eventsToCall.push(Events.adChanged);
      }

      if (currentAd && !adPlaying) {
        // ad has ended;
        eventsToCall.push(Events.adPlayEnded);
      }

      currentAd = adPlaying;
    }

    eventsToCall.length && logger.debug("Events", eventsToCall);

    // tick
    eventsToCall.push(Events.tick);

    // Dispatch all events
    eventsToCall.forEach((evt) => {
      callbacks[evt].forEach((cb) => {
        cb(cbArg[0], cbArg[1]);
      });
    });
  }, 200);
};

export const YouTubeEvents = {
  isLoopStarted: false,
  startLoop: function () {
    if (this.isLoopStarted) {
      logger.debug("Loop already started.");
      return;
    }

    this.isLoopStarted = true;
    startMainLoop();
    logger.debug("Loop started");
  },
  addListener: (event: Events, cb: Callback): void => {
    if (!EventNames.includes(event as unknown as string)) {
      return;
    }

    callbacks[event].push(cb);
  },
};
