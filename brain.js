/* ═══════════════════════════════════════════════════════════
   BRAIN.JS — STUBS
   The QNN brain scene has been removed for the clean light
   researcher portfolio. These stubs prevent inception-main.js
   and main.js from crashing when they call the old boot hooks.
   ═══════════════════════════════════════════════════════════ */

// Expose empty boot/reset hooks that inception-main.js expects
window.__nightBootBrain   = function () {};
window.__brainForceResize = function () {};
window.__resetProfileOpen = function () {};
window.__triggerProfileReveal = function () {};
