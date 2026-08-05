(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function getRandomItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }

  function renderRandomVerse() {
    const verses = Array.isArray(window.RENEBOOK_RANDOM_WISDOM_VERSES)
      ? window.RENEBOOK_RANDOM_WISDOM_VERSES
      : [];

    const verse = getRandomItem(verses);
    const reference = $("randomVerseReference");
    const text = $("randomVerseText");
    const theme = $("randomVerseTheme");

    if (!verse) {
      if (reference) reference.textContent = "Sabiduría no cargada";
      if (text) text.textContent = "Revisa el archivo /data/wisdom-random-verses.js.";
      if (theme) theme.textContent = "Renebook";
      return;
    }

    const localVerse = verse.es || verse.en || {};

    if (reference) reference.textContent = localVerse.reference || "";
    if (text) text.textContent = localVerse.text || "";

    if (theme) {
      const title = localVerse.title || "";
      const version = localVerse.version || "";
      theme.textContent = title && version
        ? `${title} · ${version}`
        : title || version || "Renebook";
    }
  }

  function init() {
    const playButton = $("randomPlayBtn");
    if (playButton) playButton.addEventListener("click", renderRandomVerse);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
