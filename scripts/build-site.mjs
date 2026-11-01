import { access, copyFile, cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "_site");

const requiredFiles = ["index.html", "404.html", "main.js"];
const requiredDirectories = ["runtime", "pages", "components", "assets"];
const routeAliases = [
  "docs.html",
  "quick-start.html",
  "cli.html",
  "deployment.html",
  "architecture.html",
  "configuration.html",
  "database.html",
  "routing.html",
  "security.html",
  "power-1-docs.html",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of requiredFiles) {
  await copyFile(join(root, file), join(output, file));
}

for (const directory of requiredDirectories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

// GitHub Pages serves real files for direct links and refreshes.
// Generate those tiny aliases from one canonical shell instead of maintaining copies.
for (const alias of routeAliases) {
  await copyFile(join(output, "index.html"), join(output, alias));
}

for (const file of [
  "index.html",
  "404.html",
  "main.js",
  "runtime/App.js",
  "pages/home/index.html",
  "pages/docs/power-1/index.html",
  "pages/errors/not-found.html",
  "components/site-footer.html",
  "components/site-brand.html",
  "components/announce.html",
  "components/docs-header.html",
  "components/docs-nav.html",
  "components/docs-layout.html",
  "assets/css/site.css",
  "assets/js/pages/home.js",
]) {
  await access(join(output, file));
}

console.log(`POWER Engine website prepared in ${output}`);
console.log(`Generated ${routeAliases.length} direct-link shells.`);
