(function () {
  var classList = [
    'videoAdUiSkipButton', // Old close ad button
    'ytp-ad-skip-button ytp-button', // New close ad button
    'ytp-ad-overlay-close-button', // Close overlay button
  ];

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
   * Starts the poll to see if any of the ad buttons are present in the page now.
   * 
   * The interval of 2 seconds is arbitrary. I guess it's a good compromise.
   */
  function initTimeout() {
    setTimeout(function() {
      checkAndClickButtons();

      initTimeout();
    }, 2000);
  }

  // Start polling:
  initTimeout();
})();
