(function () {
  var classList = [
    'videoAdUiSkipButton', // Old close ad button
    'ytp-ad-skip-button ytp-button', // New close ad button
    'ytp-ad-overlay-close-button', // Close overlay button
  ];

  var timeoutId;

  /**
   * Loops over all the class names of buttons that we need to click to skip an
   * ad or overlay and returns an array of those elements.
   *
   * @param {Array<String>} classNames - an array of class names of button that we need to click
   * @returns {Array<Element>} - An arry of DOM elements
   */
  function existingButtons(classNames) {
    return classNames.map(name => {
      return document.getElementsByClassName(name)[0];
    }).filter(v => v);
  }

  /**
   * Loops over all the buttons that need to be clicked and triggers the click
   * even on those buttons.
   */
  function checkAndClickButtons() {
    existingButtons(classList).forEach(button => {
      triggerClick(button);
    })
  }

  /**
   * Triggers a click event on the given DOM element.
   * 
   * This function is based on an answer here:
   * http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
   * 
   * @param {Element} el - The element on which to trigger the event
   */
  function triggerClick(el) {
    var etype = 'click';

    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }

  /**
   * Initializes an observer on the YouTube Video Player to get events when any
   * element in there changes. We can check for the skip ad buttons then.
   *
   * @returns {Boolean} - true if observer could be set up, false otherwise
   */
  function initObserver() {
    if (!('MutationObserver' in window)) {
      return false;
    }

    var ytdPlayer = (function(nodeList) {
      return nodeList && nodeList[0];
    })(document.getElementsByTagName('ytd-player'));

    if (!ytdPlayer) {
      return false;
    }

    var observer = new MutationObserver(function() {
      checkAndClickButtons();
    });

    observer.observe(ytdPlayer, { childList: true, subtree: true });

    clearTimeout(timeoutId); // Just for good measure

    return true;
  } 

  /**
   * We have two implementations to check for the skip ad buttons: one is based on
   * MutationObserver that is only triggered when the video-player is updated in
   * the page; second is a simple poll that constantly checks for the existence of
   * the skip ad buttons.
   * 
   * We first try to set up the mutation observer. It can sometimes fail even if the
   * browser supports it if the video player has not yet been attached to the DOM.
   * In that case, we continue the polling implementation until the observer can be
   * set up.
   */
  function initTimeout() {
    clearTimeout(timeoutId);

    if (initObserver()) {
      // We can stop the polling as the observer is set up.
      return;
    }

    /**
     * Starts the poll to see if any of the ad buttons are present in the page now.
     * The interval of 2 seconds is arbitrary. I guess it's a good compromise.
     */
    timeoutId = setTimeout(function() {
      checkAndClickButtons();

      initTimeout();
    }, 2000);
  }

  initTimeout();
})();
