/* ==========================================================
   RENEBOOK — DATA / PSALMS
   Español: Reina-Valera 1909 via GetBible "valera"
   English: World English Bible via GetBible "web"

   Archivo público esperado:
   https://renebook.org/data/psalms.js

   Carga Salmos 1–150 completo en ES/EN, normaliza la
   respuesta, conserva una copia local y publica eventos para
   que el lector pueda funcionar incluso con red inestable.
========================================================== */

(function () {
  "use strict";

  const BOOK_NUMBER = 19;
  const TOTAL_CHAPTERS = 150;
  const CACHE_KEY = "renebook_psalms_bilingual_v20260812a";
  const CACHE_DATE_KEY = `${CACHE_KEY}_saved_at`;
  const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

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

  function isComplete(data) {
    return Boolean(
      data &&
      data.es &&
      data.en &&
      Array.isArray(data.es.chapters) &&
      Array.isArray(data.en.chapters) &&
      data.es.chapters.length === TOTAL_CHAPTERS &&
      data.en.chapters.length === TOTAL_CHAPTERS
    );
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isComplete(parsed) ? parsed : null;
    } catch (error) {
      console.warn("ReneBook: no se pudo leer la copia local de Salmos.", error);
      return null;
    }
  }

  function cacheIsFresh() {
    try {
      const savedAt = Number(localStorage.getItem(CACHE_DATE_KEY) || 0);
      return savedAt > 0 && Date.now() - savedAt < MAX_CACHE_AGE;
    } catch {
      return false;
    }
  }

  function saveCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_DATE_KEY, String(Date.now()));
    } catch (error) {
      console.warn("ReneBook: no se pudo guardar la copia local de Salmos.", error);
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

  function publishData(data, source) {
    window.PSALMS = data;
    window.psalms = data;
    window.SALMOS = data;

    window.dispatchEvent(new CustomEvent("renebook:psalms-ready", {
      detail: { data, source: source || "network" }
    }));

    setTimeout(function () {
      if (typeof window.RENEBOOK_RENDER_PSALMS === "function") {
        window.RENEBOOK_RENDER_PSALMS();
      }
    }, 0);
  }

  async function loadPsalms(options) {
    const force = Boolean(options && options.force);
    const cached = readCache();

    if (!force && cached && cacheIsFresh()) {
      publishData(cached, "cache");
      return cached;
    }

    try {
      const result = await Promise.all([
        loadLanguage("es"),
        loadLanguage("en")
      ]);

      const data = { es: result[0], en: result[1] };
      saveCache(data);
      publishData(data, "network");
      console.log("ReneBook: Salmos bilingüe cargado correctamente.");
      return data;
    } catch (error) {
      console.error("ReneBook: error cargando Salmos bilingüe.", error);
      window.RENEBOOK_PSALMS_ERROR = error;

      if (cached) {
        publishData(cached, "stale-cache");
        return cached;
      }

      publishData(EMPTY_DATA, "error");
      window.dispatchEvent(new CustomEvent("renebook:psalms-error", {
        detail: error
      }));
      return EMPTY_DATA;
    }
  }

  const cached = readCache();
  publishData(cached || EMPTY_DATA, cached ? "cache" : "initial");

  window.RENEBOOK_LOAD_PSALMS = loadPsalms;
  window.RENEBOOK_PSALMS_READY = loadPsalms();
})();
