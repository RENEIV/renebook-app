import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(projectRoot, "dist");

if (outputDirectory !== join(projectRoot, "dist")) {
  throw new Error("Directorio de salida no seguro.");
}

const rootEntries = await readdir(projectRoot, { withFileTypes: true });
const htmlFiles = rootEntries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name)
  .sort();

const rootFiles = [
  ...htmlFiles,
  "_redirects",
  "manifest.json",
  "service-worker.js"
];

const staticDirectories = ["assets", "css", "data", "js"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of rootFiles) {
  await cp(join(projectRoot, file), join(outputDirectory, file));
}

for (const directory of staticDirectories) {
  await cp(join(projectRoot, directory), join(outputDirectory, directory), {
    recursive: true
  });
}

console.log(
  `ReneBook: paquete estático creado con ${htmlFiles.length} páginas y ${staticDirectories.length} directorios públicos.`
);

