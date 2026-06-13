// Animated dark/light theme toggle.
// Reveals the new theme through a circle that grows from the centre of the
// screen, while a crescent MOON (→ dark) or a SUN (→ light) blooms in the
// middle. Self-contained: it overrides window.toggleDarkMode (loaded last) so
// it doesn't depend on the per-layout inline toggles, only reusing their
// helpers (updateLogos / rehighlightCode) when present.

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var MOON =
    '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M55 6a44 44 0 1 0 39 64A38 38 0 1 1 55 6z" fill="currentColor"/></svg>';

  function sunSVG() {
    var rays = '';
    for (var i = 0; i < 8; i++) {
      var a = (i * Math.PI) / 4;
      var x1 = 50 + Math.cos(a) * 30,
        y1 = 50 + Math.sin(a) * 30;
      var x2 = 50 + Math.cos(a) * 44,
        y2 = 50 + Math.sin(a) * 44;
      rays +=
        '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
        '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
    return (
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="19" fill="currentColor"/>' +
      '<g stroke="currentColor" stroke-width="7" stroke-linecap="round">' + rays + '</g>' +
      '</svg>'
    );
  }

  function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    try {
      localStorage.setItem('darkMode', String(dark));
    } catch (e) {}
    var icon = document.getElementById('darkModeIcon');
    if (icon) icon.className = dark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    if (typeof window.updateLogos === 'function') window.updateLogos(dark);
    if (typeof window.rehighlightCode === 'function') window.rehighlightCode();
  }

  window.toggleDarkMode = function () {
    var dark = !document.body.classList.contains('dark-mode'); // target state

    if (reduce.matches || !document.body) {
      applyTheme(dark);
      return;
    }

    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var R = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 4;
    var oldBg = getComputedStyle(document.body).backgroundColor || '#fff';

    // Veil painted with the OLD background, with a transparent hole that grows
    // to reveal the freshly-themed page underneath.
    var veil = document.createElement('div');
    veil.className = 'theme-fx-veil';
    veil.style.background = oldBg;
    veil.style.setProperty('--cx', cx + 'px');
    veil.style.setProperty('--cy', cy + 'px');

    // The celestial glyph that blooms at the centre.
    var orb = document.createElement('div');
    orb.className = 'theme-fx-orb ' + (dark ? 'is-moon' : 'is-sun');
    orb.innerHTML = dark ? MOON : sunSVG();

    document.body.appendChild(veil);
    document.body.appendChild(orb);

    // Switch the theme while it's hidden behind the (still solid) veil.
    applyTheme(dark);

    requestAnimationFrame(function () {
      veil.style.setProperty('--r', R + 'px');
      veil.classList.add('run');
      orb.classList.add('run');
    });

    var cleanup = function () {
      veil.remove();
      orb.remove();
    };
    // Remove after the animation; also guard with transitionend.
    var done = setTimeout(cleanup, 950);
    veil.addEventListener('transitionend', function () {
      clearTimeout(done);
      // small delay so the orb finishes its fade
      setTimeout(cleanup, 150);
    });
  };
})();
