(() => {
  const languages = {
    de: { path: "/", message: "Website auf Deutsch ansehen?", action: "Deutsch öffnen", close: "Schließen" },
    en: { path: "/en/", message: "View this site in English?", action: "Open English", close: "Close" },
    fr: { path: "/fr/", message: "Voir le site en français ?", action: "Ouvrir en français", close: "Fermer" },
    nl: { path: "/nl/", message: "Website in het Nederlands bekijken?", action: "Nederlands openen", close: "Sluiten" },
    pl: { path: "/pl/", message: "Zobaczyć stronę po polsku?", action: "Otwórz po polsku", close: "Zamknij" },
    cs: { path: "/cs/", message: "Zobrazit web v češtině?", action: "Otevřít česky", close: "Zavřít" },
    it: { path: "/it/", message: "Vedere il sito in italiano?", action: "Apri in italiano", close: "Chiudi" },
    es: { path: "/es/", message: "Ver el sitio en español?", action: "Abrir en español", close: "Cerrar" },
    pt: { path: "/pt/", message: "Ver o site em português?", action: "Abrir em português", close: "Fechar" },
    ja: { path: "/ja/", message: "日本語でサイトを表示しますか？", action: "日本語で開く", close: "閉じる" },
  };

  const preferenceKey = "kiku-language-choice";
  const dismissedKey = "kiku-language-suggestion-dismissed";

  const normalizeLanguage = (value) => String(value || "").toLowerCase().split("-")[0];

  const readStorage = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeStorage = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore private-mode storage errors; the suggestion still works for the current page.
    }
  };

  const browserLanguage = () => {
    const values =
      Array.isArray(navigator.languages) && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || ""];
    return values.map(normalizeLanguage).find((code) => languages[code]);
  };

  const targetHref = (code) => {
    let hash = window.location.hash || "";
    if (hash === "#reservierung" && code !== "de") hash = "#reservation";
    if (hash === "#reservation" && code === "de") hash = "#reservierung";
    return `${languages[code].path}${hash}`;
  };

  const track = (action, code) => {
    if (window._paq) {
      window._paq.push(["trackEvent", "Sprache", action, code]);
    }
  };

  const rememberLanguageClicks = () => {
    document.querySelectorAll(".language-options a[lang], .mobile-language-list a[lang]").forEach((link) => {
      link.addEventListener("click", () => {
        const code = normalizeLanguage(link.getAttribute("lang"));
        if (languages[code]) writeStorage(preferenceKey, code);
      });
    });
  };

  const showSuggestion = () => {
    const current = normalizeLanguage(document.documentElement.lang) || "de";
    const target = browserLanguage();
    if (!target || target === current) return;
    if (readStorage(preferenceKey)) return;
    if (readStorage(dismissedKey) === target) return;

    const copy = languages[target];
    const banner = document.createElement("aside");
    banner.className = "language-suggestion";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Language suggestion");

    const message = document.createElement("p");
    message.textContent = copy.message;

    const action = document.createElement("a");
    action.className = "language-suggestion-action";
    action.href = targetHref(target);
    action.textContent = copy.action;
    action.addEventListener("click", () => {
      writeStorage(preferenceKey, target);
      track("Vorschlag angenommen", target);
    });

    const close = document.createElement("button");
    close.className = "language-suggestion-close";
    close.type = "button";
    close.setAttribute("aria-label", copy.close);
    close.textContent = "×";
    close.addEventListener("click", () => {
      writeStorage(dismissedKey, target);
      banner.remove();
      track("Vorschlag geschlossen", target);
    });

    banner.append(message, action, close);
    document.body.append(banner);
    track("Vorschlag angezeigt", target);
  };

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    rememberLanguageClicks();
    showSuggestion();
  });
})();
