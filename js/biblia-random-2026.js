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
      ? "Tap play to receive a biblical word of wisdom and see the featured match of the day."
      : "Toca play para recibir una palabra bíblica de sabiduría y ver el partido destacado del día.";
  }

  if (playBtn) {
    playBtn.textContent = lang === "en"
      ? "▶ Play Wisdom + Match of the Day"
      : "▶ Play Sabiduría + Partido del Día";
  }

  if (resultLabels[0]) {
    resultLabels[0].textContent = lang === "en"
      ? "📜 Biblical word"
      : "📜 Palabra bíblica";
  }

  if (resultLabels[1]) {
    resultLabels[1].textContent = lang === "en"
      ? "🏟️ Match of the day"
      : "🏟️ Partido del día";
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
