import {
  access,
  copyFile,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "_site");

const requiredFiles = ["index.html", "404.html", "main.js"];
const requiredDirectories = ["runtime", "pages", "components", "assets"];

/* ---------------------------------------------------------------------------
   Find every documentation page by looking in the folders.
     pages/docs/power-2/cli.html  ->  address  /docs/power-2/cli.html
   Folder = version. A new folder (power-3) is picked up automatically.
   Files starting with "_" (like _nav.html) are parts, not pages.
--------------------------------------------------------------------------- */
const docsRoot = join(root, "pages", "docs");
const mainJs = await readFile(join(root, "main.js"), "utf8");
const docsPages = []; // e.g. "docs/power-2/cli.html"

for (const version of await readdir(docsRoot, { withFileTypes: true })) {
  if (!version.isDirectory()) continue;

  for (const file of await readdir(join(docsRoot, version.name))) {
    if (!file.endsWith(".html") || file.startsWith("_")) continue;

    const pageFile = `pages/docs/${version.name}/${file}`;
    if (!mainJs.includes(pageFile)) {
      throw new Error(
        `${pageFile} exists but is not registered in main.js. Add a docsPage(...) route for it.`,
      );
    }
    docsPages.push(`docs/${version.name}/${file}`);
  }
}

/* The other way round: every page main.js points to must exist. */
for (const [, pageFile] of mainJs.matchAll(/\.\/(pages\/[\w\-./]+\.html)/g)) {
  await access(join(root, pageFile)).catch(() => {
    throw new Error(`main.js points to ${pageFile}, but that file does not exist.`);
  });
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of requiredFiles) {
  await copyFile(join(root, file), join(output, file));
}

for (const directory of requiredDirectories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

// GitHub Pages serves real files for direct links and refreshes.
// Generate those tiny shells from one canonical index.html instead of maintaining copies.
// A shell that sits in a folder needs "../" in front of its ./main.js and ./assets paths.
const shell = await readFile(join(root, "index.html"), "utf8");
for (const page of docsPages) {
  const depth = page.split("/").length - 1;
  const prefix = "../".repeat(depth);
  const target = join(output, page);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, shell.replaceAll('"./', `"${prefix}`));
}

for (const file of [
  "index.html",
  "404.html",
  "main.js",
  "runtime/App.js",
  "pages/home/index.html",
  "pages/errors/not-found.html",
  "components/site-footer.html",
  "components/docs-layout.html",
  "assets/css/site.css",
  "assets/js/pages/home.js",
  ...docsPages.map((page) => `pages/${page}`),
  ...docsPages.map((page) => page),
]) {
  await access(join(output, file));
}

console.log(`POWER Engine website prepared in ${output}`);
console.log(`Generated ${docsPages.length} direct-link shells:`);
for (const page of docsPages) console.log(`  /${page}`);
