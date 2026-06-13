// Prism.js initialization — shared by every layout.
// Registers a small AgentSpeak(L) grammar (not built into Prism) and then
// highlights every code block that carries a language-* class.

(function () {
  function registerAgentSpeak() {
    if (!window.Prism || Prism.languages.agentspeak) return;
    Prism.languages.agentspeak = {
      comment: [/\/\/.*/, /\/\*[\s\S]*?\*\//],
      string: { pattern: /"(?:\\.|[^"\\])*"/, greedy: true },
      'plan-operator': { pattern: /<-|:-|!!?|\?|\+|-(?=[a-z!])/, alias: 'keyword' },
      builtin: { pattern: /\.[a-z_]\w*/, alias: 'function' },
      variable: /\b[A-Z_]\w*\b/,
      number: /\b\d+(?:\.\d+)?\b/,
      operator: /:-|<-|>=|<=|==|\\==|>|<|=|&|\||~|\bnot\b|\bdiv\b|\bmod\b/,
      functor: { pattern: /[a-z]\w*(?=\()/, alias: 'symbol' },
      punctuation: /[(){}\[\].,;:]/,
    };
  }

  function highlight() {
    if (!window.Prism || !window.Prism.highlightAll) return false;
    registerAgentSpeak();
    window.Prism.highlightAll();
    return true;
  }

  // Prism's component scripts may still be parsing; retry briefly.
  function run() {
    if (highlight()) return;
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (highlight() || attempts >= 10) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Re-highlight after a dark-mode toggle so tokens repaint cleanly.
  window.rehighlightCode = function () {
    registerAgentSpeak();
    if (window.Prism && window.Prism.highlightAll) window.Prism.highlightAll();
  };
})();
