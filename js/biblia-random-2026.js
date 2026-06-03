(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function getLang() {
    const params = new URLSearchParams(window.location.search);
    const lang = String(params.get("lang") || "").toLowerCase();

    if (lang === "en") return "en";
    return "es";
  }

  function getRandomItem(items) {
    if (!Array.isArray(items) || !items.length) return null;
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  function getTodayDateKey() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  function getMatchOfTheDay() {
    const matches = Array.isArray(window.RENEBOOK_WORLDCUP_2026_MATCHES)
      ? window.RENEBOOK_WORLDCUP_2026_MATCHES
      : [];

    if (!matches.length) return null;

    const todayKey = getTodayDateKey();

    const exactMatch = matches.find((match) => match.date === todayKey);
    if (exactMatch) return exactMatch;

    const upcomingMatch = matches.find((match) => match.date > todayKey);
    if (upcomingMatch) return upcomingMatch;

    return matches[matches.length - 1];
  }

  function renderInitialLanguage() {
    const lang = getLang();

    const playBtn = $("randomPlayBtn");
    const verseReference = $("randomVerseReference");
    const verseText = $("randomVerseText");
    const verseTheme = $("randomVerseTheme");
    const matchTitle = $("matchTitle");
    const matchDetails = $("matchDetails");
    const matchLocation = $("matchLocation");

    if (playBtn) {
      playBtn.textContent = lang === "en"
        ? "▶ Play Wisdom + Match of the Day"
        : "▶ Play Sabiduría + Partido del Día";
    }

    if (verseReference) {
      verseReference.textContent = lang === "en"
        ? "Biblical Wisdom"
        : "Sabiduría bíblica";
    }

    if (verseText) {
      verseText.textContent = lang === "en"
        ? "A biblical word of wisdom will appear here."
        : "Aquí aparecerá una palabra bíblica de sabiduría.";
    }

    if (verseTheme) {
      verseTheme.textContent = lang === "en"
        ? "Daily wisdom"
        : "Sabiduría diaria";
    }

    if (matchTitle) {
      matchTitle.textContent = lang === "en"
        ? "World Cup 2026"
        : "Mundial 2026";
    }

    if (matchDetails) {
      matchDetails.textContent = lang === "en"
        ? "The featured match of the day will appear here."
        : "Aquí aparecerá el partido destacado del día.";
    }

    if (matchLocation) {
      matchLocation.textContent = lang === "en"
        ? "United States · Mexico · Canada"
        : "Estados Unidos · México · Canadá";
    }
  }

  function renderRandomExperience() {
    const lang = getLang();

    const verses = Array.isArray(window.RENEBOOK_RANDOM_WISDOM_VERSES)
      ? window.RENEBOOK_RANDOM_WISDOM_VERSES
      : [];

    const verse = getRandomItem(verses);
    const match = getMatchOfTheDay();

    const verseReference = $("randomVerseReference");
    const verseText = $("randomVerseText");
    const verseTheme = $("randomVerseTheme");
    const matchTitle = $("matchTitle");
    const matchDetails = $("matchDetails");
    const matchLocation = $("matchLocation");

    if (verse) {
      const localVerse = verse[lang] || verse.es || verse.en || {};

      if (verseReference) {
        verseReference.textContent = localVerse.reference || "";
      }

      if (verseText) {
        verseText.textContent = localVerse.text || "";
      }

      if (verseTheme) {
        const title = localVerse.title || "";
        const version = localVerse.version || "";
        verseTheme.textContent = title && version
          ? `${title} · ${version}`
          : title || version || "";
      }
    } else {
      if (verseReference) {
        verseReference.textContent = lang === "en"
          ? "Wisdom data not loaded"
          : "Sabiduría no cargada";
      }

      if (verseText) {
        verseText.textContent = lang === "en"
          ? "Check /data/wisdom-random-verses.js."
          : "Revisa /data/wisdom-random-verses.js.";
      }

      if (verseTheme) {
        verseTheme.textContent = "Renebook";
      }
    }

    if (match) {
      const localMatch = match[lang] || match.es || match.en || {};

      if (matchTitle) {
        matchTitle.textContent = localMatch.title || "";
      }

      if (matchDetails) {
        const dateText = match.date ? formatDate(match.date, lang) : "";
        const stageText = match.stage || "";
        const teamsText = localMatch.teams || "";

        matchDetails.textContent = [teamsText, stageText, dateText]
          .filter(Boolean)
          .join(" · ");
      }

      if (matchLocation) {
        const location = localMatch.location || "";
        const note = localMatch.note || "";

        matchLocation.textContent = note
          ? `${location} — ${note}`
          : location;
      }
    } else {
      if (matchTitle) {
        matchTitle.textContent = lang === "en"
          ? "Match data not loaded"
          : "Partidos no cargados";
      }

      if (matchDetails) {
        matchDetails.textContent = lang === "en"
          ? "Check /data/worldcup-2026-matches.js."
          : "Revisa /data/worldcup-2026-matches.js.";
      }

      if (matchLocation) {
        matchLocation.textContent = "Renebook";
      }
    }
  }

  function formatDate(dateString, lang) {
    try {
      const date = new Date(dateString + "T12:00:00");

      return date.toLocaleDateString(lang === "en" ? "en-US" : "es-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  }

  function bindEvents() {
    const playBtn = $("randomPlayBtn");

    if (playBtn) {
      playBtn.addEventListener("click", renderRandomExperience);
    }
  }

  function init() {
    renderInitialLanguage();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
