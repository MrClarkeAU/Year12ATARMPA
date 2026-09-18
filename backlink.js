/* ──────────────────────────────────────────────────────────────
   backlink.js — "Back to where you actually came from"

   Every guide on the Revision Hub hard-codes its return link to the
   hub. That is right when a student arrives from the hub, but it is a
   dead end when they arrive from another guide: clicking through to
   the past questions bank from the Semester Two Study Guide and then
   wanting to get back meant a detour via the hub and a second login-
   gated page load.

   This script reads document.referrer. If the student arrived from
   another page on the hub, the "← Back" link is repointed there and
   labelled with that page's name, and a "Revision Hub" link is added
   beside it so the hub is never more than one click away.

   If the referrer is the hub, is empty (bookmark, direct link, or a
   stripped referrer) or is not a page we know, the page's own default
   is left exactly as it was.

   Single source of truth: edit TITLES here only.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var HUB = 'index.html';

  var TITLES = {
    'index.html':                       'Revision Hub',
    'studyguide.html':                  'the Semester One Study Guide',
    'studyguide-s2.html':               'the Semester Two Study Guide',
    'exam-feedback-s1-2026.html':       'the Semester One Exam Guide',
    'past-questions.html':              'Past Questions',
    'wartime-propaganda-feedback.html': 'the Wartime Propaganda guide',
    'journal-entry-1.html':             'the Journal Entry 1 guide',
    'journal-entry-2.html':             'the Journal Entry 2 guide',
    'journal-entry-3.html':             'the Journal Entry 3 guide',
    'journal-entry-4.html':             'the Journal Entry 4 guide',
    'journal-entry-6.html':             'the Journal Entry 6 guide'
  };

  /* The separator travels with the hub link rather than sitting in its own
     element, so that a narrow screen wraps "· Revision Hub" onto the next
     line as one piece instead of orphaning the dot. */
  var HUB_LABEL = '· Revision Hub';

  /* Resolve an href to a same-origin file name, or null. */
  function fileOf(href) {
    if (!href) return null;
    try {
      var u = new URL(href, window.location.href);
      if (u.origin !== window.location.origin) return null;
      var name = u.pathname.split('/').pop();
      return name ? name.toLowerCase() : HUB;
    } catch (e) {
      return null;
    }
  }

  /* Every link whose visible text starts with a left arrow — this catches
     the ones styled with a class and the ones styled inline, and both the
     top and the bottom link on pages that carry two. */
  function backLinks() {
    var found = [];
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
      var text = (anchors[i].textContent || '').replace(/^\s+/, '');
      if (text.charAt(0) === '←' && fileOf(anchors[i].getAttribute('href'))) {
        found.push(anchors[i]);
      }
    }
    return found;
  }

  function run() {
    var from = fileOf(document.referrer);
    var here = fileOf(window.location.href);

    /* Nothing to improve on: no referrer, a bounce back to this same page,
       an arrival from the hub (the default already says so), or somewhere
       we do not have a name for. */
    if (!from || from === here || from === HUB || !TITLES[from]) return;

    var links = backLinks();
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute('data-backlink')) continue;
      link.setAttribute('data-backlink', 'done');

      link.setAttribute('href', from);
      link.textContent = '← Back to ' + TITLES[from];

      /* Shallow clone inherits whatever the page uses to style its back
         link — the class on most pages, the inline styles and hover
         handlers on the older journal entries. */
      var hub = link.cloneNode(false);
      hub.removeAttribute('data-backlink');
      hub.setAttribute('href', HUB);
      hub.textContent = HUB_LABEL;
      hub.style.marginLeft = '0.45rem';

      link.parentNode.insertBefore(hub, link.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
