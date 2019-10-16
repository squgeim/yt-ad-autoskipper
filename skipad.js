(function () {
  var classList = [
    'videoAdUiSkipButton', // Old close ad button
    'ytp-ad-skip-button ytp-button', // New close ad button
    'ytp-ad-overlay-close-button', // Close overlay button
  ];

  var timeoutId;
  var observedSkipBtn;
  var skipBtnObserver;

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
   * We check if the button is visible by using the `offsetParent` attribute
   * on an element. It is `null` if the element or its parent are set to have
   * style `display:none`.
   * 
   * @param {Element} button - The button element
   * @returns {boolean} - Whether the element is visible on the screen
   */
  function isBtnVisible(button) {
    return button.offsetParent === null ? false : true;
  }

  /**
   * Since we do not click the button as long as it is not visible, we can
   * attach an observer to listen for the button's attribute changes to figure
   * out when the element becomes visible.
   * 
   * @param {Element} button - The button element to click
   */
  function triggerClickWhenVisible(button) {
    if (button === observedSkipBtn) {
      // We are already observing this button.
      return;
    }

    // Find the actual parent with the display style 'none' so that we can
    // listen to that element's changes.
    var parentWithDisplayStyle = (function() {
      var currentParent = button;
      while (currentParent !== null) {
        if (currentParent.style.display === 'none') {
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

    // If we had been observing another button, disconnect from that, if that
    // element still exists in the DOM click that for good measure.
    if (skipBtnObserver && observedSkipBtn) {
      skipBtnObserver.disconnect();
      triggerClick(observedSkipBtn);
    }

    // If this is the first skip button we have encountered, we will have to
    // set up the observer first.
    if (!skipBtnObserver) {
      skipBtnObserver = new MutationObserver(function() {
        if (!isBtnVisible(observedSkipBtn)) {
          return;
        }

        triggerClick(observedSkipBtn);
        observedSkipBtn = undefined;
        skipBtnObserver.disconnect();
      });
    }

    // We are now observing this button. Note that we actually are observing
    // the button's parent that has the changing display attribute. But since we
    // will actually be working on the button when the attribute changes we need
    // to have this reference stored.
    observedSkipBtn = button;
    skipBtnObserver.observe(parentWithDisplayStyle, { attributes: true });
  }

  /**
   * Loops over all the buttons that need to be clicked and triggers the click
   * even on those buttons.
   */
  function checkAndClickButtons() {
    existingButtons(classList).forEach(button => {
      // We want to make sure that we are only pressing the skip button when it
      // is visible on the screen so that it is like an actual user is pressing
      // it. This also gives a user time to not-skip the ad.
      if (!isBtnVisible(button)) {
        triggerClickWhenVisible(button);
        
        return;
      } 

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

  /**
   * Check if we are running in an iframe. We do that by checking if our current
   * window is the same as the top parent window. The try..catch is there because
   * some browsers will not let a script in an iframe access the parent window.
   */
  var inIframe = (function() {
    try {
      return window.self !== window.top;
    } catch (e) {
      // The browser did not let us access the parent window. Still means we are
      // in an iframe.
      return true;
    }
  })();

  /**
   * Only start the script if we are in the top level. YouTube has a few iframes
   * in the page which would also be running this content script.
   */
  if (!inIframe) {
    // main:
    initTimeout();
  }
})();
