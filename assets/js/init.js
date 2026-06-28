/* Dublesh v6.9.9 — init.js */
(function() {
  'use strict';
  window.addEventListener('load', function() {
    requestAnimationFrame(function() {
      document.body.classList.add('orbs-active');
    });
  }, { passive: true, once: true });
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      var cards = document.querySelectorAll('.tc');
      cards.forEach(function(card) {
        card.style.willChange = 'auto';
      });
    }, 600);
  }, { once: true });
})();