import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const loaderSource = await readFile(new URL("../data/psalms.js", import.meta.url), "utf8");
const psalmsPage = await readFile(new URL("../app-psalms.html", import.meta.url), "utf8");
const serviceWorker = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");

function completeBook(language) {
  return {
    chapters: Array.from({ length: 150 }, function (_, index) {
      const chapter = index + 1;
      return {
        chapter,
        verses: [{
          chapter,
          verse: 1,
          text: language === "en" ? `Psalm ${chapter}` : `Salmo ${chapter}`
        }]
      };
    })
  };
}

function normalizedLanguage(language) {
  return {
    version: language === "en" ? "WEB" : "RVR1909",
    book: language === "en" ? "Psalms" : "Salmos",
    chapters: completeBook(language).chapters.map(function (chapter) {
      return {
        number: chapter.chapter,
        chapter: chapter.chapter,
        title: `${language === "en" ? "Psalm" : "Salmo"} ${chapter.chapter}`,
        verses: chapter.verses.map(function (verse) {
          return { number: verse.verse, verse: verse.verse, text: verse.text };
        })
      };
    })
  };
}

function createRuntime({ url, stored = {}, failLanguage = null }) {
  const requests = [];
  const events = [];
  const storage = new Map(Object.entries(stored));
  const listeners = new Map();

  class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  }

  const window = {
    location: { href: url },
    addEventListener(type, listener) {
      const typeListeners = listeners.get(type) || [];
      typeListeners.push(listener);
      listeners.set(type, typeListeners);
    },
    dispatchEvent(event) {
      events.push(event);
      (listeners.get(event.type) || []).forEach(function (listener) {
        listener(event);
      });
      return true;
    }
  };

  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    }
  };

  async function fetch(urlValue) {
    const requestUrl = String(urlValue);
    requests.push(requestUrl);
    const language = requestUrl.includes("/web/") ? "en" : "es";

    if (language === failLanguage) {
      throw new Error(`Fallo simulado: ${language}`);
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return completeBook(language);
      }
    };
  }

  const context = vm.createContext({
    AbortController,
    CustomEvent,
    URL,
    clearTimeout,
    console: {
      error() {},
      log() {},
      warn() {}
    },
    document: { documentElement: { lang: "es" } },
    fetch,
    localStorage,
    setTimeout,
    window
  });

  vm.runInContext(loaderSource, context, { filename: "data/psalms.js" });
  return { events, requests, storage, window };
}

{
  const runtime = createRuntime({ url: "https://renebook.org/app-psalms.html?lang=es" });
  const duplicateLoad = runtime.window.RENEBOOK_LOAD_PSALMS({ lang: "es" });
  await Promise.all([runtime.window.RENEBOOK_PSALMS_READY, duplicateLoad]);

  assert.equal(runtime.requests.length, 1, "La primera visita y una llamada concurrente deben compartir solicitud.");
  assert.match(runtime.requests[0], /\/valera\/19\.json$/, "Español debe solicitar RVR1909.");
  assert.equal(runtime.window.PSALMS.es.chapters.length, 150);
  assert.equal(runtime.window.PSALMS.en.chapters.length, 0);
  assert.ok(runtime.events.some(function (event) {
    return event.type === "renebook:psalms-ready" &&
      event.detail.lang === "es" &&
      event.detail.source === "network";
  }));

  await runtime.window.RENEBOOK_LOAD_PSALMS({ lang: "en" });
  assert.equal(runtime.requests.length, 2, "El segundo idioma debe cargarse solo al solicitarlo.");
  assert.match(runtime.requests[1], /\/web\/19\.json$/, "English debe solicitar WEB.");
  assert.equal(runtime.window.PSALMS.es.chapters.length, 150);
  assert.equal(runtime.window.PSALMS.en.chapters.length, 150);

  await runtime.window.RENEBOOK_LOAD_PSALMS({ lang: "es" });
  assert.equal(runtime.requests.length, 2, "Una copia local vigente no debe repetir la descarga.");
  assert.ok(runtime.storage.has("renebook_psalms_v20260812b_es"));
  assert.ok(runtime.storage.has("renebook_psalms_v20260812b_en"));
}

{
  const runtime = createRuntime({ url: "https://renebook.org/app-psalms.html?lang=en" });
  await runtime.window.RENEBOOK_PSALMS_READY;

  assert.equal(runtime.requests.length, 1, "English también debe iniciar con una sola solicitud.");
  assert.match(runtime.requests[0], /\/web\/19\.json$/);
  assert.equal(runtime.window.PSALMS.es.chapters.length, 0);
  assert.equal(runtime.window.PSALMS.en.chapters.length, 150);
}

{
  const legacyKey = "renebook_psalms_bilingual_v20260812a";
  const legacyDateKey = `${legacyKey}_saved_at`;
  const runtime = createRuntime({
    url: "https://renebook.org/app-psalms.html?lang=es",
    stored: {
      [legacyKey]: JSON.stringify({
        es: normalizedLanguage("es"),
        en: normalizedLanguage("en")
      }),
      [legacyDateKey]: String(Date.now())
    }
  });
  await runtime.window.RENEBOOK_PSALMS_READY;

  assert.equal(runtime.requests.length, 0, "La copia bilingüe vigente debe migrarse sin redescargar.");
  assert.equal(runtime.window.PSALMS.es.chapters.length, 150);
  assert.equal(runtime.window.PSALMS.en.chapters.length, 150);
  assert.equal(runtime.storage.has(legacyKey), false);
  assert.equal(runtime.storage.has(legacyDateKey), false);
  assert.ok(runtime.storage.has("renebook_psalms_v20260812b_es"));
  assert.ok(runtime.storage.has("renebook_psalms_v20260812b_en"));
}

{
  const runtime = createRuntime({
    url: "https://renebook.org/app-psalms.html?lang=es",
    failLanguage: "en"
  });
  await runtime.window.RENEBOOK_PSALMS_READY;
  await runtime.window.RENEBOOK_LOAD_PSALMS({ lang: "en" });

  assert.equal(runtime.window.PSALMS.es.chapters.length, 150, "Un fallo en English no debe borrar español.");
  assert.equal(runtime.window.PSALMS.en.chapters.length, 0);
  assert.equal(runtime.window.RENEBOOK_PSALMS_ERRORS.es, null);
  assert.ok(runtime.window.RENEBOOK_PSALMS_ERRORS.en instanceof Error);
}

assert.match(psalmsPage, /ensureCurrentLanguage\(\)/);
assert.match(psalmsPage, /RENEBOOK_LOAD_PSALMS\(\{[\s\S]*?lang: state\.lang/);
assert.doesNotMatch(psalmsPage, /data\[state\.lang\]\s*\|\|\s*data\.es/);
assert.match(serviceWorker, /renebook-v7-20260812-salmos-idioma/);

console.log("ReneBook: carga de Salmos por idioma verificada.");
