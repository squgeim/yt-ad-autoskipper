const CLASS_LIST = [
  "videoAdUiSkipButton", // Old close ad button
  "ytp-ad-skip-button ytp-button", // New close ad button
  "ytp-ad-overlay-close-button", // Close overlay button
];

let timeoutId: number;
let observedSkipBtn: HTMLElement | undefined;
let skipBtnObserver: MutationObserver;

/**
 * Loops over all the class names of buttons that we need to click to skip an
 * ad or overlay, and returns an array of those elements.
 *
 * @param classNames - an array of class names of buttons that we need to click
 */
function existingButtons(classNames: string[]): HTMLElement[] {
  return classNames
    .map((name) => Array.from(document.getElementsByClassName(name)) || [])
    .reduce((acc, elems) => acc.concat(elems), [])
    .map((elem) => elem as HTMLElement);
}

/**
 * We check if the button is visible by using the `offsetParent` attribute
 * on an element. It is `null` if the element, or any of its parents, is set
 * to have style `display:none`.
 *
 * @param button - The button element
 */
function isBtnVisible(button: HTMLElement): boolean {
  return button.offsetParent !== null;
}

/**
 * Since we do not click the button as long as it is not visible, we can
 * attach an observer to listen for the button's attribute changes to figure
 * out when the element becomes visible.
 *
 * @param button - The button element to click
 */
function triggerClickWhenVisible(button: HTMLElement): void {
  if (button === observedSkipBtn) {
    // We are already observing this button.
    return;
  }

  // Find the actual parent with the display style 'none' so that we can
  // listen to that element's changes.
  const parentWithDisplayStyle = (() => {
    let currentParent: HTMLElement | null = button;

    while (currentParent !== null) {
      if (currentParent.style.display === "none") {
        return currentParent;
      }

      currentParent = currentParent.parentElement;
    }

    return null;
  })();

  if (!parentWithDisplayStyle) {
    // Give up.
    return;
  }

  // If we had been observing another button, disconnect from that. If that
  // element still exists in the DOM, click on it for good measure.
  if (skipBtnObserver && observedSkipBtn) {
    skipBtnObserver.disconnect();
    triggerClick(observedSkipBtn);
  }

  // If this is the first skip button we have encountered, we will have to
  // set up the observer first.
  if (!skipBtnObserver) {
    skipBtnObserver = new MutationObserver(() => {
      if (!observedSkipBtn || !isBtnVisible(observedSkipBtn)) {
        return;
      }

      triggerClick(observedSkipBtn);
      observedSkipBtn = undefined;
      skipBtnObserver.disconnect();
    });
  }

  // Since we will eventually be working on the button we need to have this
  // reference stored.
  observedSkipBtn = button;

  // Note that we are actually observing the button's parent that has the
  // display attribute, as the skip button's visibilty is controlled by its
  // parent.
  skipBtnObserver.observe(parentWithDisplayStyle, { attributes: true });
}

/**
 * Loops over all the buttons that need to be clicked and triggers the click
 * even on those buttons.
 */
function checkAndClickButtons(): void {
  existingButtons(CLASS_LIST).forEach((button) => {
    // We want to make sure that we are only pressing the skip button when it
    // is visible on the screen, so that it is like an actual user is pressing
    // it. This also gives a user time to not-skip the ad in the future.
    if (!isBtnVisible(button)) {
      triggerClickWhenVisible(button);

      return;
    }

    triggerClick(button);
  });
}

/**
 * Triggers a click event on the given DOM element.
 *
 * This function is based on an answer here:
 * http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
 *
 * @param {Element} el - The element on which to trigger the event
 */
function triggerClick(el: HTMLElement): void {
  const evObj = document.createEvent("Events");
  evObj.initEvent("click", true, false);
  el.dispatchEvent(evObj);
}

/**
 * Initializes an observer on the YouTube Video Player to get events when any
 * of its child elements change. We can check for the existance of the skip ad
 * buttons on those changes.
 *
 * Returns true if observer could be set up, false otherwise.
 */
function initObserver(): boolean {
  if (!("MutationObserver" in window)) {
    return false;
  }

  const ytdPlayer = ((nodeList) => {
    return nodeList && nodeList[0];
  })(document.getElementsByTagName("ytd-player"));

  if (!ytdPlayer) {
    return false;
  }

  const observer = new MutationObserver(() => {
    checkAndClickButtons();
  });

  observer.observe(ytdPlayer, { childList: true, subtree: true });

  clearTimeout(timeoutId); // Just for good measure

  return true;
}

/**
 * We have two implementations to check for the skip ad buttons: one is based on
 * MutationObserver, that is only triggered when the video-player is updated in
 * the page; second is a simple poll that constantly checks for the existence of
 * the skip ad buttons.
 *
 * We first try to set up the mutation observer. It can sometimes fail even when the
 * browser supports it, if the video player has not yet been attached to the DOM.
 * In such cases, we continue the polling implementation until the observer can be
 * set up.
 */
function initTimeout(): void {
  clearTimeout(timeoutId);

  if (initObserver()) {
    // We can stop the polling as the observer is set up.
    return;
  }

  /**
   * Starts the poll to see if any of the ad buttons are present in the page now.
   * The interval of 2 seconds is arbitrary. I believe it is a good compromise.
   */
  timeoutId = setTimeout(() => {
    checkAndClickButtons();

    initTimeout();
  }, 2000);
}

/**
 * Check if we are running in an iframe. We do that by checking if our current
 * window is the same as the top parent window. The try..catch is there because
 * some browsers will not let a script in an iframe access the parent window.
 */
const inIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // The browser did not let us access the parent window. Which also means we
    // are in an iframe.
    return true;
  }
})();

/**
 * Only start the script if we are at the top level. YouTube has a few iframes
 * in the page which would also be running this content script.
 */
if (!inIframe) {
  // main:
  initTimeout();
}
