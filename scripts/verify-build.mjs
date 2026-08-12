import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(projectRoot, "dist");

const requiredFiles = [
  "index.html",
  "app-bible.html",
  "app-biblia-random.html",
  "app-psalms.html",
  "proyecto.html",
  "vision.html",
  "gracias.html",
  "manifest.json",
  "service-worker.js",
  "_redirects",
  "assets/renebook-logo.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "css/biblia-random.css",
  "js/biblia-random.js",
  "data/proverbs.js",
  "data/psalms.js",
  "data/wisdom-books.js"
];

for (const file of requiredFiles) {
  await access(join(outputDirectory, file));
}

const manifest = JSON.parse(
  await readFile(join(outputDirectory, "manifest.json"), "utf8")
);

if (!manifest.shortcuts?.some((shortcut) => shortcut.url.includes("app-psalms"))) {
  throw new Error("El manifiesto no incluye el acceso directo a Salmos.");
}

const serviceWorker = await readFile(
  join(outputDirectory, "service-worker.js"),
  "utf8"
);

if (!serviceWorker.includes("renebook-v7-20260812-salmos-idioma")) {
  throw new Error("El service worker no contiene la versión de caché esperada.");
}

for (const coreFile of ["/app-bible.html", "/app-psalms.html", "/data/psalms.js"]) {
  if (!serviceWorker.includes(`"${coreFile}"`)) {
    throw new Error(`El service worker no precarga ${coreFile}.`);
  }
}

const psalmsPage = await readFile(
  join(outputDirectory, "app-psalms.html"),
  "utf8"
);

for (const marker of [
  "los 150 Salmos",
  "all 150 Psalms",
  "renebook:psalms-ready",
  "ensureCurrentLanguage",
  "dataSources"
]) {
  if (!psalmsPage.includes(marker)) {
    throw new Error(`La página de Salmos no contiene: ${marker}`);
  }
}

const psalmsLoader = await readFile(
  join(outputDirectory, "data/psalms.js"),
  "utf8"
);

for (const marker of [
  'CACHE_VERSION = "v20260812b"',
  "RENEBOOK_PSALMS_INITIAL_LANGUAGE",
  "RENEBOOK_PSALMS_SOURCES"
]) {
  if (!psalmsLoader.includes(marker)) {
    throw new Error(`El cargador de Salmos no contiene: ${marker}`);
  }
}

const outputEntries = await readdir(outputDirectory);
for (const forbidden of ["node_modules", "src", "package.json", "README.md"] ) {
  if (outputEntries.includes(forbidden)) {
    throw new Error(`El paquete público expone un archivo interno: ${forbidden}.`);
  }
}

console.log(`ReneBook: paquete verificado (${requiredFiles.length} archivos esenciales).`);
