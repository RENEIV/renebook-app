/* ==========================================================
   RENEBOOK — DATA / PSALMS
   Español: Reina-Valera 1909 via GetBible "valera"
   English: World English Bible via GetBible "web"

   Archivo público esperado:
   https://renebook.org/data/psalms.js

   Carga primero el idioma solicitado, normaliza Salmos 1–150,
   conserva una copia local por idioma y publica eventos para
   que el lector pueda funcionar incluso con red inestable.
========================================================== */

(function () {
  "use strict";

  const BOOK_NUMBER = 19;
  const TOTAL_CHAPTERS = 150;
  const CACHE_VERSION = "v20260812b";
  const CACHE_PREFIX = `renebook_psalms_${CACHE_VERSION}`;
  const LEGACY_CACHE_KEY = "renebook_psalms_bilingual_v20260812a";
  const LEGACY_CACHE_DATE_KEY = `${LEGACY_CACHE_KEY}_saved_at`;
  const LANGUAGE_STORAGE_KEY = "renebook_psalms_language";
  const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;
  const inFlight = { es: null, en: null };

  const SOURCES = {
    es: {
      api: "valera",
      version: "RVR1909",
      book: "Salmos",
      titlePrefix: "Salmo"
    },
    en: {
      api: "web",
      version: "WEB",
      book: "Psalms",
      titlePrefix: "Psalm"
    }
  };

  const EMPTY_DATA = {
    es: { version: "RVR1909", book: "Salmos", chapters: [] },
    en: { version: "WEB", book: "Psalms", chapters: [] }
  };

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
    return [];
  }

  function normalizeLanguage(value) {
    return String(value || "").toLowerCase() === "en" ? "en" : "es";
  }

  function getInitialLanguage() {
    try {
      const url = new URL(window.location.href);
      const queryLanguage = url.searchParams.get("lang");
      if (queryLanguage) return normalizeLanguage(queryLanguage);
    } catch {}

    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) return normalizeLanguage(savedLanguage);
    } catch {}

    return normalizeLanguage(document.documentElement.lang || "es");
  }

  function cacheKey(langKey) {
    return `${CACHE_PREFIX}_${langKey}`;
  }

  function cacheDateKey(langKey) {
    return `${cacheKey(langKey)}_saved_at`;
  }

  function isLanguageComplete(data) {
    return Boolean(
      data &&
      Array.isArray(data.chapters) &&
      data.chapters.length === TOTAL_CHAPTERS
    );
  }

  function readLanguageCache(langKey) {
    try {
      const raw = localStorage.getItem(cacheKey(langKey));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isLanguageComplete(parsed) ? parsed : null;
    } catch (error) {
      console.warn(`ReneBook: no se pudo leer Salmos desde la copia local (${langKey}).`, error);
      return null;
    }
  }

  function cacheIsFresh(langKey) {
    try {
      const savedAt = Number(localStorage.getItem(cacheDateKey(langKey)) || 0);
      return savedAt > 0 && Date.now() - savedAt < MAX_CACHE_AGE;
    } catch {
      return false;
    }
  }

  function saveLanguageCache(langKey, data, savedAt) {
    try {
      localStorage.setItem(cacheKey(langKey), JSON.stringify(data));
      localStorage.setItem(cacheDateKey(langKey), String(savedAt || Date.now()));
      return true;
    } catch (error) {
      console.warn(`ReneBook: no se pudo guardar Salmos localmente (${langKey}).`, error);
      return false;
    }
  }

  function migrateLegacyCache() {
    try {
      const raw = localStorage.getItem(LEGACY_CACHE_KEY);
      if (!raw) return;

      const legacy = JSON.parse(raw);
      const savedAt = Number(localStorage.getItem(LEGACY_CACHE_DATE_KEY) || Date.now());
      let migrated = true;

      ["es", "en"].forEach(function (langKey) {
        if (!isLanguageComplete(legacy && legacy[langKey])) {
          migrated = false;
          return;
        }
        if (!readLanguageCache(langKey)) {
          migrated = saveLanguageCache(langKey, legacy[langKey], savedAt) && migrated;
        }
      });

      if (migrated) {
        localStorage.removeItem(LEGACY_CACHE_KEY);
        localStorage.removeItem(LEGACY_CACHE_DATE_KEY);
      }
    } catch (error) {
      console.warn("ReneBook: no se pudo migrar la copia bilingüe anterior.", error);
    }
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[GH]\d+\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeChapter(payload, langKey, fallbackNumber) {
    const source = SOURCES[langKey];
    const rawVerses = asArray(payload && payload.verses);
    const chapterNumber = Number(
      (payload && (payload.chapter || payload.nr || payload.number)) ||
      (rawVerses[0] && rawVerses[0].chapter) ||
      fallbackNumber
    );

    return {
      number: chapterNumber,
      chapter: chapterNumber,
      title: `${source.titlePrefix} ${chapterNumber}`,
      verses: rawVerses
        .map(function (verse, index) {
          const verseNumber = Number(verse.verse || verse.nr || verse.number || index + 1);
          return {
            number: verseNumber,
            verse: verseNumber,
            text: cleanText(verse.text)
          };
        })
        .filter(function (verse) {
          return verse.number > 0 && verse.text;
        })
    };
  }

  function normalizeBook(payload, langKey) {
    if (!payload) return null;

    let rawChapters = asArray(payload.chapters);

    if (!rawChapters.length && payload.verses) {
      const grouped = {};
      asArray(payload.verses).forEach(function (verse) {
        const chapterNumber = Number(verse.chapter);
        if (!grouped[chapterNumber]) {
          grouped[chapterNumber] = { chapter: chapterNumber, verses: [] };
        }
        grouped[chapterNumber].verses.push(verse);
      });
      rawChapters = Object.values(grouped);
    }

    const chapters = rawChapters
      .map(function (chapterPayload, index) {
        return normalizeChapter(chapterPayload, langKey, index + 1);
      })
      .filter(function (chapter) {
        return chapter.chapter >= 1 && chapter.chapter <= TOTAL_CHAPTERS;
      })
      .sort(function (a, b) {
        return a.chapter - b.chapter;
      });

    return chapters.length === TOTAL_CHAPTERS ? chapters : null;
  }

  async function fetchJSON(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(function () {
      controller.abort();
    }, timeoutMs || 30000);

    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — ${url}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadBookInOneRequest(langKey) {
    const source = SOURCES[langKey];
    const url = `https://api.getbible.net/v2/${source.api}/${BOOK_NUMBER}.json`;
    const payload = await fetchJSON(url, 45000);
    const chapters = normalizeBook(payload, langKey);

    if (!chapters) {
      throw new Error(`Formato incompleto al cargar Salmos: ${source.api}`);
    }

    return {
      version: source.version,
      book: source.book,
      chapters
    };
  }

  async function loadBookByBatches(langKey) {
    const source = SOURCES[langKey];
    const chapters = [];
    const batchSize = 6;

    for (let start = 1; start <= TOTAL_CHAPTERS; start += batchSize) {
      const numbers = Array.from(
        { length: Math.min(batchSize, TOTAL_CHAPTERS - start + 1) },
        function (_, index) { return start + index; }
      );

      const batch = await Promise.all(numbers.map(async function (chapterNumber) {
        const url = `https://api.getbible.net/v2/${source.api}/${BOOK_NUMBER}/${chapterNumber}.json`;
        const payload = await fetchJSON(url, 20000);
        return normalizeChapter(payload, langKey, chapterNumber);
      }));

      chapters.push.apply(chapters, batch);
    }

    chapters.sort(function (a, b) { return a.chapter - b.chapter; });

    if (chapters.length !== TOTAL_CHAPTERS) {
      throw new Error(`No se recibieron los 150 salmos: ${source.api}`);
    }

    return {
      version: source.version,
      book: source.book,
      chapters
    };
  }

  async function loadLanguage(langKey) {
    try {
      return await loadBookInOneRequest(langKey);
    } catch (bookError) {
      console.warn(
        `ReneBook: reintentando Salmos por capítulos (${langKey}).`,
        bookError
      );
      return loadBookByBatches(langKey);
    }
  }

  function getCurrentData() {
    const current = window.PSALMS || window.psalms || window.SALMOS || {};
    return {
      es: isLanguageComplete(current.es) ? current.es : EMPTY_DATA.es,
      en: isLanguageComplete(current.en) ? current.en : EMPTY_DATA.en
    };
  }

  function publishData(data, source, langKey) {
    window.PSALMS = data;
    window.psalms = data;
    window.SALMOS = data;
    window.RENEBOOK_PSALMS_SOURCES = window.RENEBOOK_PSALMS_SOURCES || {
      es: "initial",
      en: "initial"
    };

    if (langKey) {
      window.RENEBOOK_PSALMS_SOURCES[langKey] = source || "network";
    }

    window.dispatchEvent(new CustomEvent("renebook:psalms-ready", {
      detail: { data, source: source || "network", lang: langKey || null }
    }));

    setTimeout(function () {
      if (typeof window.RENEBOOK_RENDER_PSALMS === "function") {
        window.RENEBOOK_RENDER_PSALMS();
      }
    }, 0);

    return data;
  }

  function publishLanguage(langKey, languageData, source) {
    const data = getCurrentData();
    data[langKey] = isLanguageComplete(languageData)
      ? languageData
      : EMPTY_DATA[langKey];
    return publishData(data, source, langKey);
  }

  function setLanguageError(langKey, error) {
    window.RENEBOOK_PSALMS_ERRORS = window.RENEBOOK_PSALMS_ERRORS || {
      es: null,
      en: null
    };
    window.RENEBOOK_PSALMS_ERRORS[langKey] = error || null;
    window.RENEBOOK_PSALMS_ERROR = error || null;
  }

  async function loadPsalms(options) {
    const langKey = normalizeLanguage(
      options && options.lang ? options.lang : getInitialLanguage()
    );
    const force = Boolean(options && options.force);
    const cached = readLanguageCache(langKey);

    if (!force && cached && cacheIsFresh(langKey)) {
      setLanguageError(langKey, null);
      return publishLanguage(langKey, cached, "cache");
    }

    if (!force && cached) {
      publishLanguage(langKey, cached, "stale-cache");
    }

    if (inFlight[langKey]) return inFlight[langKey];

    inFlight[langKey] = (async function () {
      try {
        const languageData = await loadLanguage(langKey);
        saveLanguageCache(langKey, languageData);
        setLanguageError(langKey, null);
        const data = publishLanguage(langKey, languageData, "network");
        console.log(`ReneBook: Salmos cargado correctamente (${langKey}).`);
        return data;
      } catch (error) {
        console.error(`ReneBook: error cargando Salmos (${langKey}).`, error);
        setLanguageError(langKey, error);

        if (!cached) {
          publishLanguage(langKey, EMPTY_DATA[langKey], "error");
        }

        window.dispatchEvent(new CustomEvent("renebook:psalms-error", {
          detail: { error, lang: langKey }
        }));
        return getCurrentData();
      } finally {
        inFlight[langKey] = null;
      }
    })();

    return inFlight[langKey];
  }

  migrateLegacyCache();

  const initialLanguage = getInitialLanguage();
  const initialCache = {
    es: readLanguageCache("es") || EMPTY_DATA.es,
    en: readLanguageCache("en") || EMPTY_DATA.en
  };

  window.RENEBOOK_PSALMS_INITIAL_LANGUAGE = initialLanguage;
  window.RENEBOOK_PSALMS_ERRORS = { es: null, en: null };
  window.RENEBOOK_PSALMS_SOURCES = {
    es: isLanguageComplete(initialCache.es) ? "cache" : "initial",
    en: isLanguageComplete(initialCache.en) ? "cache" : "initial"
  };

  publishData(
    initialCache,
    window.RENEBOOK_PSALMS_SOURCES[initialLanguage],
    initialLanguage
  );

  window.RENEBOOK_LOAD_PSALMS = loadPsalms;
  window.RENEBOOK_PSALMS_READY = loadPsalms({ lang: initialLanguage });
})();
