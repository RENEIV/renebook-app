/* ==========================================================
   RENEBOOK — DATA / PROVERBS
   Español: Reina-Valera 1909 via GetBible "valera"
   English: World English Bible via GetBible "web"

   Archivo público esperado:
   https://renebook.org/data/proverbs.js

   IMPORTANTE:
   Este archivo carga Proverbios 1–31 completo en ES/EN,
   normaliza la estructura para la app, y guarda caché local.
========================================================== */

(function () {
  "use strict";

  const BOOK_NUMBER = 20; // Proverbs / Proverbios
  const TOTAL_CHAPTERS = 31;
const CACHE_KEY = "renebook_proverbs_bilingual_v20260516b";

  const SOURCES = {
    es: {
      api: "valera",
      version: "RVR1909",
      book: "Proverbios",
      titlePrefix: "Proverbios"
    },
    en: {
      api: "web",
      version: "WEB",
      book: "Proverbs",
      titlePrefix: "Proverbs"
    }
  };

  const EMPTY_DATA = {
    es: {
      version: "RVR1909",
      book: "Proverbios",
      chapters: []
    },
    en: {
      version: "WEB",
      book: "Proverbs",
      chapters: []
    }
  };

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (
        parsed &&
        parsed.es &&
        parsed.en &&
        Array.isArray(parsed.es.chapters) &&
        Array.isArray(parsed.en.chapters) &&
        parsed.es.chapters.length === TOTAL_CHAPTERS &&
        parsed.en.chapters.length === TOTAL_CHAPTERS
      ) {
        return parsed;
      }

      return null;
    } catch (error) {
      console.warn("Renebook: no se pudo leer caché de Proverbios.", error);
      return null;
    }
  }

  function saveCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Renebook: no se pudo guardar caché de Proverbios.", error);
    }
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[GH]\d+\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function polishSpanishText(text) {
    return String(text || "")
      .replace(/^([A-ZÁÉÍÓÚÜÑ]{2,})(\s+)/, function (_, word, space) {
        return word.charAt(0) + word.slice(1).toLocaleLowerCase("es") + space;
      })
      .replace(/\bmio\b/g, "mío")
      .replace(/\bMio\b/g, "Mío");
  }

  function patchVerseText(langKey, chapterNumber, verseNumber, text) {
  if (langKey !== "es") return text;

  const polished = polishSpanishText(text);
  const key = `${chapterNumber}:${verseNumber}`;

  const fixes = {
    "2:1": "Hijo mío, si tomares mis palabras, y mis mandamientos guardares dentro de ti;",
    "4:1": "Oíd, hijos, la enseñanza de un padre, y estad atentos, para que conozcáis cordura.",
    "8:1": "¿No clama la sabiduría, y da su voz la inteligencia?"
  };

  return fixes[key] || polished;
}
  
  function normalizeChapter(payload, langKey, fallbackChapterNumber) {
    const source = SOURCES[langKey];
    const rawVerses = Array.isArray(payload?.verses) ? payload.verses : [];

    const chapterNumber = Number(
      payload?.chapter ||
      rawVerses[0]?.chapter ||
      fallbackChapterNumber
    );

    return {
      number: chapterNumber,
      chapter: chapterNumber,
      title: `${source.titlePrefix} ${chapterNumber}`,
      verses: rawVerses.map(function (verse) {
        const verseNumber = Number(verse.verse || verse.number);

        return {
          number: verseNumber,
          verse: verseNumber,
          text: patchVerseText(langKey, chapterNumber, verseNumber, cleanText(verse.text))
        };
      })
    };
  }

  function normalizeBook(payload, langKey) {
    if (!payload) return null;

    let rawChapters = [];

    if (Array.isArray(payload.chapters)) {
      rawChapters = payload.chapters;
    } else if (payload.chapters && typeof payload.chapters === "object") {
      rawChapters = Object.values(payload.chapters);
    } else if (Array.isArray(payload.verses)) {
      const grouped = {};

      payload.verses.forEach(function (verse) {
        const chapterNumber = Number(verse.chapter);
        if (!grouped[chapterNumber]) {
          grouped[chapterNumber] = {
            chapter: chapterNumber,
            verses: []
          };
        }
        grouped[chapterNumber].verses.push(verse);
      });

      rawChapters = Object.values(grouped);
    }

    if (!rawChapters.length) return null;

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

    if (chapters.length !== TOTAL_CHAPTERS) return null;

    return chapters;
  }

  async function fetchJSON(url) {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — ${url}`);
    }

    return response.json();
  }

  async function loadBookBySingleRequest(langKey) {
    const source = SOURCES[langKey];
    const url = `https://api.getbible.net/v2/${source.api}/${BOOK_NUMBER}.json`;
    const payload = await fetchJSON(url);
    const chapters = normalizeBook(payload, langKey);

    if (!chapters) {
      throw new Error(`Formato inesperado al cargar libro completo: ${source.api}`);
    }

    return {
      version: source.version,
      book: source.book,
      chapters
    };
  }

  async function loadBookByChapters(langKey) {
    const source = SOURCES[langKey];
    const chapters = [];

    for (let chapter = 1; chapter <= TOTAL_CHAPTERS; chapter += 1) {
      const url = `https://api.getbible.net/v2/${source.api}/${BOOK_NUMBER}/${chapter}.json`;
      const payload = await fetchJSON(url);
      chapters.push(normalizeChapter(payload, langKey, chapter));
    }

    return {
      version: source.version,
      book: source.book,
      chapters
    };
  }

  async function loadLanguage(langKey) {
    try {
      return await loadBookBySingleRequest(langKey);
    } catch (bookError) {
      console.warn(
        `Renebook: no se pudo cargar ${langKey} por libro completo. Intentando capítulo por capítulo.`,
        bookError
      );

      return loadBookByChapters(langKey);
    }
  }

  function publishData(data) {
    window.PROVERBS = data;

    // Alias de compatibilidad por si otros archivos usan nombres anteriores.
    window.proverbs = data;
    window.PROVERBIOS = data;

    window.dispatchEvent(
      new CustomEvent("renebook:proverbs-ready", {
        detail: data
      })
    );

    setTimeout(function () {
      if (typeof window.renderProverbsReader === "function") {
        window.renderProverbsReader();
      }
    }, 0);
  }

  async function loadProverbs() {
    try {
      const result = await Promise.all([
        loadLanguage("es"),
        loadLanguage("en")
      ]);

      const data = {
        es: result[0],
        en: result[1]
      };

      saveCache(data);
      publishData(data);

      console.log("Renebook: Proverbios bilingüe cargado correctamente.", data);
      return data;
    } catch (error) {
      console.error("Renebook: error cargando Proverbios bilingüe.", error);

      window.RENEBOOK_PROVERBS_ERROR = error;

      window.dispatchEvent(
        new CustomEvent("renebook:proverbs-error", {
          detail: error
        })
      );

      return window.PROVERBS;
    }
  }

  // 1) Publicar primero caché si existe, para que la app abra rápido.
  const cached = readCache();

  if (cached) {
    publishData(cached);
  } else {
    publishData(EMPTY_DATA);
  }

  // 2) Luego cargar datos frescos desde GetBible.
  window.RENEBOOK_LOAD_PROVERBS = loadProverbs;
  window.RENEBOOK_PROVERBS_READY = loadProverbs();
})();

