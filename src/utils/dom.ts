/**
 * Check if we are running in an iframe. We do that by checking if our current
 * window is the same as the top parent window. The try..catch is there because
 * some browsers will not let a script in an iframe access the parent window.
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // The browser did not let us access the parent window. Which also means we
    // are in an iframe.
    return true;
  }
}

/**
 * We check if the button is visible by using the `offsetParent` attribute
 * on an element. It is `null` if the element, or any of its parents, is set
 * to have style `display:none`.
 */
export function isElementVisible(elem: HTMLElement): boolean {
  return elem.offsetParent !== null;
}

/**
 * Triggers a click event on the given DOM element.
 *
 * This function is based on an answer here:
 * http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
 *
 * @param {Element} el - The element on which to trigger the event
 */
export function clickElem(el: HTMLElement): void {
  const evObj = document.createEvent("Events");
  evObj.initEvent("click", true, false);
  el.dispatchEvent(evObj);
}

export function getElementsByClassNames(classNames: string[]): HTMLElement[] {
  return classNames
    .map((name) => Array.from(document.getElementsByClassName(name)) || [])
    .reduce((acc, elems) => acc.concat(elems), [])
    .map((elem) => elem as HTMLElement);
}
