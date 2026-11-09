// Copie l'appli web (racine du dépôt) dans mobile/www, embarquée telle quelle dans les applis.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const www = join(here, "..", "www");

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const f of ["index.html", "sw.js", "manifest.webmanifest", "icon.svg", "sang-data.json", "icons", "img", "data"]) {
  const src = join(root, f);
  if (existsSync(src)) cpSync(src, join(www, f), { recursive: true });
}
console.log("Appli web copiée dans", www);
