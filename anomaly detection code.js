cta = function (a, b) {
  var c = 1,
    d = [];
  try {
    var e = document.querySelector(".ytp-ad-skip-button-slot");
    e
      ? getComputedStyle(e).display === "none"
        ? d.push("BISCOTTI_BASED_DETECTION_STATE_IS_BUTTON_INVISIBLE")
        : d.push("BISCOTTI_BASED_DETECTION_STATE_IS_BUTTON_VISIBLE")
      : d.push("BISCOTTI_BASED_DETECTION_STATE_IS_BUTTON_NOT_FOUND");
  } catch (f) {
    d.push("BISCOTTI_BASED_DETECTION_STATE_IS_FINDING_BUTTON_FAILURE");
  }
  a.isTrusted === !0
    ? d.push("BISCOTTI_BASED_DETECTION_STATE_IS_CLICK_EVENT_TRUSTED")
    : a.isTrusted === !1
    ? d.push("BISCOTTI_BASED_DETECTION_STATE_IS_CLICK_EVENT_NOT_TRUSTED")
    : d.push("BISCOTTI_BASED_DETECTION_STATE_IS_CLICK_EVENT_TRUSTED_UNDEFINED");
  d.includes("BISCOTTI_BASED_DETECTION_STATE_IS_CLICK_EVENT_NOT_TRUSTED") &&
    (c = 0);
  Pq("ISDSTAT", c);
  fy(c, "i.s_", {
    rfa: "sk",
    metadata: b,
    states: d,
  });
  return c;
};
