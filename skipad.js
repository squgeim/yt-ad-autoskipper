; (function () {

  /**
   * This function checks if the current page has a skip ad button
   * available yet. If it has the button, a click event is fired on
   * the button. If no such button is found, or if the current page
   * is not a video page (/watch), then we do nothing.
   * The interval period of 2 seconds is arbitary, but I guess 2sec
   * is a good choice.
   */
  var timeout = setInterval(function () {
    if (window.location.pathname !== '/watch') {
      return;
    }
    var skipButton = document.getElementsByClassName('ytp-ad-skip-button ytp-button')[0];
    var overlayCloseButton = document.getElementsByClassName('ytp-ad-overlay-close-button')[0];
    if (skipButton) {
      eventFire(skipButton, 'click');
    }
    if (overlayCloseButton) {
      eventFire(overlayCloseButton, 'click');
    }
  }, 1000);

  /**
   * Got this function from:
   * http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
   */
  function eventFire(el, etype) {
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }

})();

