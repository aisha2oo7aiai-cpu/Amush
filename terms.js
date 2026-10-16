(function () {
  // Bump this when the Terms change materially: everyone will be asked to agree again.
  var TERMS_VERSION = "1.0";
  var KEY = "amush_terms_consent";

  var overlay = document.getElementById("tcOverlay");
  var scrollBox = document.getElementById("tcScroll");
  var check = document.getElementById("tcCheck");
  var checkWrap = document.getElementById("tcCheckWrap");
  var agreeBtn = document.getElementById("tcAgree");
  var closeBtn = document.getElementById("tcClose");
  var hint = document.getElementById("tcHint");
  var page = document.querySelectorAll("body > :not(.tc-overlay):not(script)");

  var scrolledToEnd = false;
  var mandatory = false;
  var lastFocus = null;

  // localStorage can throw (private mode, blocked storage), so wrap it.
  function hasAccepted() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      return !!saved && saved.version === TERMS_VERSION;
    } catch (e) { return false; }
  }
  function saveAcceptance() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: TERMS_VERSION, acceptedAt: new Date().toISOString() }));
    } catch (e) { /* if storage fails, they'll simply be asked again next visit */ }
  }

  function updateButton() {
    agreeBtn.disabled = !(scrolledToEnd && check.checked);
    hint.hidden = scrolledToEnd;
  }

  function checkScroll() {
    // 4px tolerance for browser rounding
    if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 4) {
      scrolledToEnd = true;
    }
    updateButton();
  }

  function setPageBlocked(blocked) {
    page.forEach(function (el) {
      if (blocked) { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); }
      else { el.removeAttribute("inert"); el.removeAttribute("aria-hidden"); }
    });
    document.body.style.overflow = blocked ? "hidden" : "";
  }

  function open(isMandatory) {
    mandatory = isMandatory;
    lastFocus = document.activeElement;
    scrollBox.scrollTop = 0;

    // First-visit mode: checkbox + Agree. Review mode: read-only with Close.
    checkWrap.hidden = agreeBtn.hidden = !isMandatory;
    closeBtn.hidden = isMandatory;
    hint.hidden = !isMandatory;
    check.checked = false;
    scrolledToEnd = !isMandatory;

    overlay.hidden = false;
    setPageBlocked(true);
    scrollBox.focus();
    if (isMandatory) checkScroll(); // enables immediately if text fits without scrolling
  }

  function close() {
    overlay.hidden = true;
    setPageBlocked(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  scrollBox.addEventListener("scroll", checkScroll);
  check.addEventListener("change", updateButton);

  agreeBtn.addEventListener("click", function () {
    if (agreeBtn.disabled) return;
    saveAcceptance();
    close();
  });
  closeBtn.addEventListener("click", close);

  // Keyboard: Esc closes only the optional review view. Tab stays inside the modal.
  overlay.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mandatory) { close(); return; }
    if (e.key !== "Tab") return;
    var items = overlay.querySelectorAll("button:not([disabled]):not([hidden]), input:not([hidden]), [tabindex='0']");
    var visible = Array.prototype.filter.call(items, function (el) { return el.offsetParent !== null; });
    if (!visible.length) return;
    var first = visible[0], last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Permanent links (footer etc.) reopen the document for review.
  document.querySelectorAll(".open-terms").forEach(function (link) {
    link.addEventListener("click", function (e) { e.preventDefault(); open(false); });
  });

  // Show automatically on first visit (or when the Terms version changes).
  if (!hasAccepted()) open(true);
})();