(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const ROTATION_KEY = "renebook_sbre_rotation_v1";
  const PROGRESS_KEY = "renebook_growth_progress_v1";
  const LANG_KEY = "renebookLang";
  const RECOGNITION_KEY = "renebook_public_recognition_opt_in_v1";
  const TIME_ZONE = "America/Los_Angeles";
  const MIN_READING_SECONDS = 12;

  let selectedVerse = null;
  let readingSeconds = 0;
  let readingTimer = null;
  let activeLang = null;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getDateKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date);
  }

  function getYesterdayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return getDateKey(date);
  }

  function getLang() {
    if (activeLang) return activeLang;
    const params = new URLSearchParams(window.location.search);
    const queryLang = String(params.get("lang") || "").toLowerCase();
    if (queryLang === "en" || queryLang === "english" || queryLang === "web") return "en";
    if (queryLang === "es" || queryLang === "spanish" || queryLang === "rvr1909") return "es";
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "es";
  }

  function setLang(lang) {
    const safeLang = lang === "en" ? "en" : "es";
    activeLang = safeLang;
    document.documentElement.lang = safeLang;
    localStorage.setItem(LANG_KEY, safeLang);

    document.querySelectorAll("[data-es][data-en]").forEach((element) => {
      element.textContent = element.getAttribute(`data-${safeLang}`);
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === safeLang);
    });

    renderSelectedVerse();
    renderProgress();
    updateCompletionButton();
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function getVerseId(verse, index) {
    return String(verse.id ?? verse.day ?? `${verse.es?.reference || "verse"}-${index}`);
  }

  function loadRotationState() {
    return safeParse(localStorage.getItem(ROTATION_KEY), {
      cycle: 1,
      usedIds: [],
      history: [],
      daily: null
    });
  }

  function saveRotationState(state) {
    state.history = Array.isArray(state.history) ? state.history.slice(-400) : [];
    localStorage.setItem(ROTATION_KEY, JSON.stringify(state));
  }

  function selectDailyVerse() {
    const verses = Array.isArray(window.RENEBOOK_DAILY_VERSES)
      ? window.RENEBOOK_DAILY_VERSES
      : [];

    if (!verses.length) return null;

    const today = getDateKey();
    const state = loadRotationState();

    if (state.daily?.date === today) {
      const saved = verses.find((verse, index) => getVerseId(verse, index) === String(state.daily.id));
      if (saved) return saved;
    }

    const indexed = verses.map((verse, index) => ({
      verse,
      id: getVerseId(verse, index)
    }));

    let usedIds = Array.isArray(state.usedIds) ? state.usedIds.map(String) : [];
    let candidates = indexed.filter((item) => !usedIds.includes(item.id));

    if (!candidates.length) {
      state.cycle = Number(state.cycle || 1) + 1;
      usedIds = [];
      candidates = indexed;
    }

    const recentHistory = Array.isArray(state.history) ? state.history.slice(-14) : [];
    const recentBooks = new Set(recentHistory.slice(-3).map((item) => item.bookGroup).filter(Boolean));
    const recentThemes = new Set(recentHistory.slice(-7).map((item) => item.theme).filter(Boolean));

    const strictCandidates = candidates.filter((item) => {
      return !recentBooks.has(item.verse.bookGroup) && !recentThemes.has(item.verse.theme);
    });

    const bookVarietyCandidates = candidates.filter((item) => !recentBooks.has(item.verse.bookGroup));
    const eligible = strictCandidates.length
      ? strictCandidates
      : bookVarietyCandidates.length
        ? bookVarietyCandidates
        : candidates;

    eligible.sort((first, second) => {
      const firstScore = hashString(`${today}|${state.cycle}|${first.id}`);
      const secondScore = hashString(`${today}|${state.cycle}|${second.id}`);
      return firstScore - secondScore;
    });

    const chosen = eligible[0];
    state.usedIds = [...usedIds, chosen.id];
    state.daily = { date: today, id: chosen.id };
    state.history = [
      ...(Array.isArray(state.history) ? state.history : []),
      {
        date: today,
        id: chosen.id,
        bookGroup: chosen.verse.bookGroup || "",
        theme: chosen.verse.theme || ""
      }
    ];
    saveRotationState(state);

    return chosen.verse;
  }

  function localContent(verse) {
    const lang = getLang();
    return verse?.[lang] || verse?.es || verse?.en || {};
  }

  function renderSelectedVerse() {
    if (!selectedVerse) return;

    const content = localContent(selectedVerse);
    const devotional = content.devotional || {};
    const lang = getLang();

    if ($("dailyDate")) {
      $("dailyDate").textContent = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-US", {
        timeZone: TIME_ZONE,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }).format(new Date());
    }

    if ($("randomVerseReference")) $("randomVerseReference").textContent = content.reference || "";
    if ($("randomVerseText")) $("randomVerseText").textContent = content.text || "";
    if ($("randomVerseTheme")) {
      const theme = selectedVerse.theme || "daily scripture";
      $("randomVerseTheme").textContent = `${theme} · ${content.version || ""}`;
    }
    if ($("randomVerseTitle")) $("randomVerseTitle").textContent = devotional.title || "";
    if ($("randomVerseReflection")) $("randomVerseReflection").textContent = devotional.reflection || "";
    if ($("randomVerseApplication")) $("randomVerseApplication").textContent = devotional.application || "";
    if ($("randomVersePrayer")) $("randomVersePrayer").textContent = devotional.prayer || "";
  }

  function loadProgress() {
    return safeParse(localStorage.getItem(PROGRESS_KEY), {
      total: 0,
      streak: 0,
      lastDate: null,
      completedDates: []
    });
  }

  function saveProgress(progress) {
    progress.completedDates = Array.isArray(progress.completedDates)
      ? progress.completedDates.slice(-400)
      : [];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  function getLevel(total) {
    const lang = getLang();
    const levels = [
      { min: 0, max: 2, es: "Semilla", en: "Seed", icon: "🌱", next: 3 },
      { min: 3, max: 9, es: "Bronce", en: "Bronze", icon: "🥉", next: 10 },
      { min: 10, max: 29, es: "Plata", en: "Silver", icon: "🥈", next: 30 },
      { min: 30, max: 89, es: "Oro", en: "Gold", icon: "🥇", next: 90 },
      { min: 90, max: Infinity, es: "Lámpara", en: "Lamp", icon: "🕯️", next: null }
    ];
    const level = levels.find((item) => total >= item.min && total <= item.max) || levels[0];
    return { ...level, label: lang === "en" ? level.en : level.es };
  }

  function renderProgress() {
    const progress = loadProgress();
    const level = getLevel(Number(progress.total || 0));

    if ($("readingLevel")) $("readingLevel").textContent = `${level.icon} ${level.label}`;
    if ($("readingStreak")) $("readingStreak").textContent = String(progress.streak || 0);
    if ($("readingTotal")) $("readingTotal").textContent = String(progress.total || 0);

    const percent = level.next
      ? Math.max(0, Math.min(100, ((progress.total - level.min) / (level.next - level.min)) * 100))
      : 100;

    if ($("levelProgressBar")) $("levelProgressBar").style.width = `${percent}%`;
    if ($("levelProgressText")) {
      $("levelProgressText").textContent = level.next
        ? (getLang() === "en"
          ? `${level.next - progress.total} reading(s) to the next level`
          : `${level.next - progress.total} lectura(s) para el próximo nivel`)
        : (getLang() === "en" ? "A faithful reading journey" : "Un camino fiel de lectura");
    }
  }

  function updateCompletionButton() {
    const button = $("completeReadingBtn");
    const status = $("readingTimerStatus");
    if (!button) return;

    const progress = loadProgress();
    const completedToday = progress.completedDates?.includes(getDateKey());
    const lang = getLang();

    if (completedToday) {
      button.disabled = true;
      button.textContent = lang === "en" ? "✓ Reading completed today" : "✓ Lectura completada hoy";
      if (status) status.textContent = lang === "en" ? "Your progress was saved on this device." : "Tu progreso quedó guardado en este dispositivo.";
      return;
    }

    const remaining = Math.max(0, MIN_READING_SECONDS - readingSeconds);
    button.disabled = remaining > 0;
    button.textContent = remaining > 0
      ? (lang === "en" ? `Reading… ${remaining}s` : `Leyendo… ${remaining}s`)
      : (lang === "en" ? "Mark reading complete" : "Marcar lectura completada");

    if (status) {
      status.textContent = remaining > 0
        ? (lang === "en" ? "Take a quiet moment with the passage." : "Toma un momento tranquilo con el pasaje.")
        : (lang === "en" ? "You may now complete today’s reading." : "Ya puedes completar la lectura de hoy.");
    }
  }

  function startReadingTimer() {
    if (readingTimer) window.clearInterval(readingTimer);
    readingTimer = window.setInterval(() => {
      if (!document.hidden) {
        readingSeconds += 1;
        updateCompletionButton();
        if (readingSeconds >= MIN_READING_SECONDS) {
          window.clearInterval(readingTimer);
          readingTimer = null;
        }
      }
    }, 1000);
  }

  function completeReading() {
    const today = getDateKey();
    const progress = loadProgress();

    if (progress.completedDates?.includes(today)) return;

    progress.total = Number(progress.total || 0) + 1;
    progress.streak = progress.lastDate === getYesterdayKey()
      ? Number(progress.streak || 0) + 1
      : 1;
    progress.lastDate = today;
    progress.completedDates = [...(progress.completedDates || []), today];
    saveProgress(progress);

    renderProgress();
    updateCompletionButton();
    showCelebration(progress);
  }

  function showCelebration(progress) {
    const layer = $("readingCelebration");
    const applause = $("applauseField");
    if (!layer || !applause) return;

    const level = getLevel(progress.total);
    if ($("celebrationTitle")) {
      $("celebrationTitle").textContent = getLang() === "en"
        ? "Reading completed"
        : "Lectura completada";
    }
    if ($("celebrationText")) {
      $("celebrationText").textContent = getLang() === "en"
        ? `${level.icon} ${level.label} level · ${progress.streak} day streak`
        : `${level.icon} Nivel ${level.label} · Racha de ${progress.streak} día(s)`;
    }

    applause.innerHTML = "";
    for (let index = 0; index < 14; index += 1) {
      const icon = document.createElement("span");
      icon.textContent = index % 3 === 0 ? "✨" : "👏";
      icon.style.left = `${6 + Math.random() * 88}%`;
      icon.style.animationDelay = `${Math.random() * 0.6}s`;
      applause.appendChild(icon);
    }

    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add("is-visible"));
  }

  function closeCelebration() {
    const layer = $("readingCelebration");
    if (!layer) return;
    layer.classList.remove("is-visible");
    window.setTimeout(() => { layer.hidden = true; }, 220);
  }

  async function shareVerse() {
    if (!selectedVerse) return;
    const content = localContent(selectedVerse);
    const devotional = content.devotional || {};
    const shareText = `${content.text || ""} — ${content.reference || ""}\n${devotional.title || ""}\nRenebook.org`;

    try {
      if (navigator.share) {
        await navigator.share({ title: devotional.title || "Renebook", text: shareText, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        const button = $("shareVerseBtn");
        if (button) {
          const original = button.textContent;
          button.textContent = getLang() === "en" ? "Copied" : "Copiado";
          window.setTimeout(() => { button.textContent = original; }, 1800);
        }
      }
    } catch (error) {
      // El usuario puede cancelar el diálogo para compartir sin que sea un error de la aplicación.
    }
  }

  function bindEvents() {
    $("randomPlayBtn")?.addEventListener("click", () => {
      $("readingExperience")?.scrollIntoView({ behavior: "smooth", block: "start" });
      startReadingTimer();
    });
    $("completeReadingBtn")?.addEventListener("click", completeReading);
    $("shareVerseBtn")?.addEventListener("click", shareVerse);
    $("closeCelebrationBtn")?.addEventListener("click", closeCelebration);
    $("readingCelebration")?.addEventListener("click", (event) => {
      if (event.target === $("readingCelebration")) closeCelebration();
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => setLang(button.dataset.lang));
    });

    const recognition = $("publicRecognitionConsent");
    if (recognition) {
      recognition.checked = localStorage.getItem(RECOGNITION_KEY) === "true";
      recognition.addEventListener("change", () => {
        localStorage.setItem(RECOGNITION_KEY, String(recognition.checked));
      });
    }
  }

  function init() {
    selectedVerse = selectDailyVerse();
    setLang(getLang());
    bindEvents();
    renderSelectedVerse();
    renderProgress();
    updateCompletionButton();
    startReadingTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
