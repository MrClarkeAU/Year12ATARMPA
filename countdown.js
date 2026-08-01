/* ============================================================
   Art Film Countdown — shared floating widget
   Style 01 "Subtle floating pill", bottom-right, all pages.
   Single source of truth: edit TARGET / labels here only.
   Drop into any page with: <script src="countdown.js" defer></script>
   ============================================================ */
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────
  // Target: Friday 18 September 2026, 3:10pm Western Australia time
  // (end of Period 6 / end of school day).
  // Pinned to AWST (UTC+8, no daylight saving) via a fixed UTC
  // instant, so the countdown reads correctly regardless of the
  // viewer's device timezone. 3:10pm AWST = 07:10 UTC.
  // (Month is 0-indexed: 8 = September.)
  var TARGET = Date.UTC(2026, 8, 18, 7, 10, 0);
  var LABEL = "Art Film due";
  var DONE_TEXT = "Art Film submitted 🎉"; // 🎉
  var STORAGE_KEY = "artFilmCountdownCollapsed";

  // Don't double-inject if the script is included twice.
  if (window.__artFilmCountdownLoaded) return;
  window.__artFilmCountdownLoaded = true;

  // ── Styles ─────────────────────────────────────────────────
  var MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";
  var css = ""
    + "#artfilm-countdown{position:fixed;right:18px;bottom:18px;z-index:9000;"
    + "font-family:'Source Sans 3',system-ui,sans-serif;}"
    + "#artfilm-countdown .afc-pill{display:inline-flex;align-items:center;gap:.7rem;"
    + "background:rgba(18,18,26,.92);border:1px solid #2a2a3a;border-radius:100px;"
    + "padding:.6rem 1.05rem;box-shadow:0 8px 30px rgba(0,0,0,.45);"
    + "-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);"
    + "cursor:pointer;transition:border-color .3s,transform .2s;}"
    + "#artfilm-countdown .afc-pill:hover{border-color:#f472b6;transform:translateY(-1px);}"
    + "#artfilm-countdown .afc-dot{width:8px;height:8px;border-radius:50%;background:#f472b6;"
    + "box-shadow:0 0 10px #f472b6;animation:afcPulse 2s infinite;flex:none;}"
    + "@keyframes afcPulse{0%,100%{opacity:1}50%{opacity:.35}}"
    + "#artfilm-countdown .afc-label{font-family:" + MONO + ";font-size:.6rem;"
    + "letter-spacing:.16em;text-transform:uppercase;color:#7a7a94;line-height:1.2;}"
    + "#artfilm-countdown .afc-time{font-family:" + MONO + ";font-size:.95rem;font-weight:500;"
    + "color:#e0e0ec;letter-spacing:.02em;line-height:1.25;white-space:nowrap;}"
    + "#artfilm-countdown .afc-time b{color:#f472b6;font-weight:600;}"
    + "#artfilm-countdown .afc-x{font-family:" + MONO + ";font-size:.95rem;color:#7a7a94;"
    + "background:none;border:none;cursor:pointer;line-height:1;padding:0 0 0 .15rem;"
    + "transition:color .2s;}"
    + "#artfilm-countdown .afc-x:hover{color:#f472b6;}"
    + "#artfilm-countdown.afc-collapsed .afc-pill{padding:.55rem;gap:0;}"
    + "#artfilm-countdown.afc-collapsed .afc-body,#artfilm-countdown.afc-collapsed .afc-x{display:none;}"
    + "@media(max-width:520px){#artfilm-countdown{right:10px;bottom:10px;}"
    + "#artfilm-countdown .afc-time{font-size:.82rem;}}"
    + "@media print{#artfilm-countdown{display:none;}}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;

  // ── Markup ─────────────────────────────────────────────────
  var root = document.createElement("div");
  root.id = "artfilm-countdown";
  root.setAttribute("aria-live", "off");
  root.innerHTML =
      '<div class="afc-pill" role="button" tabindex="0" '
    + 'title="Art Film submission — Fri 18 Sep 2026, 3:10pm AWST · school days only (click to collapse)">'
    +   '<span class="afc-dot"></span>'
    +   '<div class="afc-body">'
    +     '<div class="afc-label">' + LABEL + '</div>'
    +     '<div class="afc-time" id="afc-time">— d — h — m — s</div>'
    +   '</div>'
    +   '<button class="afc-x" aria-label="Collapse countdown">✕</button>'
    + '</div>';

  function pad(n) { return String(n).padStart(2, "0"); }

  var timeEl;
  var AWST_OFFSET = 8 * 3600 * 1000;
  function tick() {
    var now = Date.now();
    if (now >= TARGET) {
      timeEl.innerHTML = "<b>" + DONE_TEXT + "</b>";
      return false; // stop ticking
    }
    // Count only weekdays (Mon–Fri in AWST) between now and target.
    // Weekend hours are skipped so the "days" figure reflects school days.
    var weekdayMs = 0;
    var cursor = now;
    while (cursor < TARGET) {
      var awst = new Date(cursor + AWST_OFFSET);
      var dow = awst.getUTCDay(); // 0=Sun … 6=Sat, evaluated against AWST calendar
      var endOfAwstDayUtc = Date.UTC(
        awst.getUTCFullYear(),
        awst.getUTCMonth(),
        awst.getUTCDate() + 1
      ) - AWST_OFFSET;
      var stop = Math.min(endOfAwstDayUtc, TARGET);
      if (dow !== 0 && dow !== 6) weekdayMs += stop - cursor;
      cursor = stop;
    }
    var days = Math.floor(weekdayMs / 86400000);
    var hours = Math.floor((weekdayMs % 86400000) / 3600000);
    var mins = Math.floor((weekdayMs % 3600000) / 60000);
    var secs = Math.floor((weekdayMs % 60000) / 1000);
    timeEl.innerHTML = "<b>" + days + "</b>d " + pad(hours) + "h " + pad(mins) + "m " + pad(secs) + "s";
    return true;
  }

  function init() {
    document.head.appendChild(styleEl);
    document.body.appendChild(root);
    timeEl = document.getElementById("afc-time");

    // Restore collapsed preference.
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") root.classList.add("afc-collapsed");
    } catch (e) {}

    function toggle() {
      var collapsed = root.classList.toggle("afc-collapsed");
      try { localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0"); } catch (e) {}
    }

    var pill = root.querySelector(".afc-pill");
    var xBtn = root.querySelector(".afc-x");
    pill.addEventListener("click", function (e) {
      if (e.target === xBtn) return; // handled below
      toggle();
    });
    pill.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
    xBtn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });

    tick();
    var id = setInterval(function () {
      if (tick() === false) clearInterval(id);
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
