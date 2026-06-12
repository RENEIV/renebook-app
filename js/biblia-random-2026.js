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

  function getMatchesOfTheDay() {
    const matches = Array.isArray(window.RENEBOOK_WORLDCUP_2026_MATCHES)
      ? window.RENEBOOK_WORLDCUP_2026_MATCHES
      : [];

    if (!matches.length) {
      return {
        type: "empty",
        date: "",
        matches: []
      };
    }

    const todayKey = getTodayDateKey();

    const exactMatches = matches
      .filter((match) => match.date === todayKey)
      .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));

    if (exactMatches.length) {
      return {
        type: "today",
        date: todayKey,
        matches: exactMatches
      };
    }

    const nextMatch = matches.find((match) => match.date > todayKey);

    if (nextMatch) {
      const nextMatches = matches
        .filter((match) => match.date === nextMatch.date)
        .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));

      return {
        type: "upcoming",
        date: nextMatch.date,
        matches: nextMatches
      };
    }

    const lastMatch = matches[matches.length - 1];

    const lastMatches = matches
      .filter((match) => match.date === lastMatch.date)
      .sort((a, b) => new Date(a.kickoffUtc) - new Date(b.kickoffUtc));

    return {
      type: "last",
      date: lastMatch.date,
      matches: lastMatches
    };
  }

  function renderInitialLanguage() {
    const lang = getLang();

    document.documentElement.lang = lang;

    const brandSubtitle = document.querySelector(".brand-row span");
    const eyebrow = document.querySelector(".eyebrow");
    const title = document.querySelector("h1");
    const lead = document.querySelector(".lead");
    const resultLabels = document.querySelectorAll(".result-label");
    const links = document.querySelectorAll(".secondary-link");

    const playBtn = $("randomPlayBtn");
    const verseReference = $("randomVerseReference");
    const verseText = $("randomVerseText");
    const verseTheme = $("randomVerseTheme");
    const matchTitle = $("matchTitle");
    const matchDetails = $("matchDetails");
    const matchLocation = $("matchLocation");

    if (brandSubtitle) {
      brandSubtitle.textContent = lang === "en"
        ? "Bible Random World Cup 2026"
        : "Biblia Random Mundial 2026";
    }

    if (eyebrow) {
      eyebrow.textContent = lang === "en"
        ? "⚽ Biblical Wisdom + World Cup 2026"
        : "⚽ Sabiduría bíblica + Mundial 2026";
    }

    if (title) {
      title.textContent = lang === "en"
        ? "Bible Random World Cup 2026"
        : "Biblia Random Mundial 2026";
    }

    if (lead) {
      lead.textContent = lang === "en"
        ? "Tap play to receive a biblical word of wisdom and see all matches of the day."
        : "Toca play para recibir una palabra bíblica de sabiduría y ver todos los partidos del día.";
    }

    if (playBtn) {
      playBtn.textContent = lang === "en"
        ? "▶ Play Wisdom + Matches of the Day"
        : "▶ Play Sabiduría + Partidos del Día";
    }

    if (resultLabels[0]) {
      resultLabels[0].textContent = lang === "en"
        ? "📜 Biblical word"
        : "📜 Palabra bíblica";
    }

    if (resultLabels[1]) {
      resultLabels[1].textContent = lang === "en"
        ? "🏟️ Matches of the day"
        : "🏟️ Partidos del día";
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
        ? "All matches of the day will appear here."
        : "Aquí aparecerán todos los partidos del día.";
    }

    if (matchLocation) {
      matchLocation.textContent = lang === "en"
        ? "United States · Mexico · Canada"
        : "Estados Unidos · México · Canadá";
    }

    if (links[0]) {
      links[0].textContent = lang === "en"
        ? "Open Bible App"
        : "Abrir App Biblia";
    }

    if (links[1]) {
      links[1].textContent = lang === "en"
        ? "Back to Renebook"
        : "Volver a Renebook";
    }
  }

  function launchCelebration() {
    const existingLayer = document.querySelector(".confetti-layer");
    if (existingLayer) existingLayer.remove();

    const layer = document.createElement("div");
    layer.className = "confetti-layer";

    const icons = ["⚽", "🏆", "✨", "🎉", "⭐"];
    const total = 38;

    for (let i = 0; i < total; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = icons[Math.floor(Math.random() * icons.length)];

      piece.style.left = Math.random() * 100 + "vw";
      piece.style.animationDelay = Math.random() * 0.7 + "s";
      piece.style.fontSize = 1.15 + Math.random() * 1.2 + "rem";

      layer.appendChild(piece);
    }

    document.body.appendChild(layer);

    setTimeout(() => {
      layer.remove();
    }, 3600);
  }

  function renderRandomExperience() {
    const lang = getLang();

    launchCelebration();

    const verses = Array.isArray(window.RENEBOOK_RANDOM_WISDOM_VERSES)
      ? window.RENEBOOK_RANDOM_WISDOM_VERSES
      : [];

    const verse = getRandomItem(verses);
    const matchResult = getMatchesOfTheDay();

    const verseReference = $("randomVerseReference");
    const verseText = $("randomVerseText");
    const verseTheme = $("randomVerseTheme");
    const matchTitle = $("matchTitle");
    const matchDetails = $("matchDetails");
    const matchLocation = $("matchLocation");

    if (verse) {
      const localVerse = verse[lang] || verse.es || verse.en || {};

      if (verseReference) verseReference.textContent = localVerse.reference || "";
      if (verseText) verseText.textContent = localVerse.text || "";

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

      if (verseTheme) verseTheme.textContent = "Renebook";
    }

    renderMatches(matchResult, lang, matchTitle, matchDetails, matchLocation);
  }

  function renderMatches(matchResult, lang, matchTitle, matchDetails, matchLocation) {
    const matches = matchResult.matches || [];

    if (!matches.length) {
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

      if (matchLocation) matchLocation.textContent = "Renebook";
      return;
    }

    const dateText = formatDate(matchResult.date, lang);

    if (matchTitle) {
      if (matchResult.type === "today") {
        matchTitle.textContent = lang === "en"
          ? `Matches of the day · ${dateText}`
          : `Partidos del día · ${dateText}`;
      } else if (matchResult.type === "upcoming") {
        matchTitle.textContent = lang === "en"
          ? `Upcoming matches · ${dateText}`
          : `Próximos partidos · ${dateText}`;
      } else {
        matchTitle.textContent = lang === "en"
          ? `Last registered matches · ${dateText}`
          : `Últimos partidos registrados · ${dateText}`;
      }
    }

    if (matchDetails) {
      matchDetails.innerHTML = matches
        .map((match) => buildMatchHTML(match, lang))
        .join("");
    }

    if (matchLocation) {
      matchLocation.textContent = lang === "en"
        ? `${matches.length} match(es) listed for this date.`
        : `${matches.length} partido(s) registrados para esta fecha.`;
    }
  }

  function buildMatchHTML(match, lang) {
    const localMatch = match[lang] || match.es || match.en || {};

    const homeName = match.home ? (match.home[lang] || match.home.es || "") : "";
    const awayName = match.away ? (match.away[lang] || match.away.es || "") : "";
    const homeFlag = match.home ? (match.home.flag || "") : "";
    const awayFlag = match.away ? (match.away.flag || "") : "";
    const stadiumText = match.stadium
      ? (match.stadium[lang] || match.stadium.es || "")
      : (localMatch.location || "");

    const kickoffText = match.kickoffUtc
      ? formatKickoffTime(match.kickoffUtc, lang)
      : (match.officialTime || "");

    const note = localMatch.note || "";
    const stageText = match.stage || "";

    return `
      <div class="match-day-item">
        <strong>${homeFlag} ${homeName} vs ${awayName} ${awayFlag}</strong>
        <span>${kickoffText}</span>
        <span>${stageText}</span>
        <span>${stadiumText}</span>
        <small>${note}</small>
      </div>
    `;
  }

  function formatKickoffTime(kickoffUtc, lang) {
    try {
      const date = new Date(kickoffUtc);

      return date.toLocaleString(lang === "en" ? "en-US" : "es-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short"
      });
    } catch (error) {
      return kickoffUtc;
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
