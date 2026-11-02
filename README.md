<!--
  P.O.W.E.R. Engine — project documentation
  Keep claims aligned with the current experimental runtime.
-->

<div align="center">

# ⚡ P.O.W.E.R. Engine

### Page Observer with Extraction & Route

**A lightweight, dependency-free browser runtime for modular, route-driven web experiences.**

Build reusable pages from HTML fragments, pass route data into templates, and navigate between views with native browser APIs.

<br />

[🌐 Live Demo](https://orpanap.github.io/power-framework/)
· [📦 Source Code](https://github.com/OrpanAp/power-framework) · [🚀 P.O.W.E.R. 2.0](https://github.com/OrpanAp/power-2.0)

<br />

![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111)
![Runtime](https://img.shields.io/badge/Runtime-Native%20Browser%20APIs-3178C6?style=for-the-badge&logo=googlechrome&logoColor=white)
![Dependencies](https://img.shields.io/badge/Runtime%20Dependencies-0-16A34A?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Experimental-F59E0B?style=for-the-badge)

</div>

---

## Overview

P.O.W.E.R. Engine is a small client-side runtime built with native browser capabilities. It loads HTML fragments for configured routes, interpolates route-provided values, supports reusable HTML and CSS includes, and manages navigation without requiring a third-party runtime framework.

This repository also contains the documentation website for **P.O.W.E.R. 2.0**, the separate Node.js framework. The documentation site itself uses the original **P.O.W.E.R. Engine 1.0** runtime in `runtime/App.js`.

> **Project status:** Experimental / educational. This is a custom runtime, not a drop-in replacement for a mature production framework. Review the known limitations and security notes before using it with untrusted content or in production.

## ✨ What it supports

- **Route configuration** — map browser-facing URLs to HTML fragment files.
- **Template interpolation** — insert route props with nested paths such as `{{ user.name }}`.
- **Reusable includes** — load HTML components and CSS resources from templates.
- **Client-side navigation** — navigate through `data-meta-href` and the History API.
- **Browser history** — handle Back and Forward navigation.
- **Page metadata** — update document titles and meta descriptions for configured routes.
- **Template caching** — cache rendered page data with native `Map` and `DocumentFragment` APIs.
- **Page scripts** — support inline scripts and external scripts referenced by a page fragment.
- **GitHub Pages support** — generate root-level route aliases for direct links and page refreshes.
- **No third-party runtime dependencies** — the runtime is implemented with browser APIs and JavaScript modules.

## 🧭 How it works

At a high level, the runtime follows this flow:

1. **Configure routes** in `main.js`, including each route's URL, template path, metadata, and props.
2. **Load templates** from the configured HTML fragment files.
3. **Resolve includes and interpolation** to assemble the requested view.
4. **Render the selected route** into the root element.
5. **Handle navigation** and update the browser history and page metadata.

The website is built from one canonical HTML shell and reusable fragments. The build script creates the deployable `_site/` directory and the small HTML aliases needed for direct routes on GitHub Pages.

## 🗂️ Project structure

```text
.
├── .github/
│   └── workflows/
│       └── static1.yml
├── assets/
│   ├── css/
│   └── js/
├── components/
│   ├── site-brand.html      (logo + name + tagline)
│   ├── announce.html        (top banner)
│   ├── docs-header.html     (docs header)
│   ├── docs-nav.html        (docs sidebar links)
│   ├── docs-layout.html     (docs page frame, uses a slot)
│   └── site-footer.html
├── pages/
│   ├── home/
│   ├── docs/
│   └── errors/
├── runtime/
│   └── App.js
├── scripts/
│   └── build-site.mjs
├── main.js
├── index.html
└── 404.html
```

| Path | Purpose |
| --- | --- |
| `runtime/App.js` | Core routing, template, and browser-runtime behavior |
| `main.js` | Route definitions, page metadata, and route props |
| `pages/` | HTML fragments for the home page and documentation |
| `components/` | Reusable HTML fragments |
| `assets/` | Stylesheets, scripts, and other static resources |
| `scripts/build-site.mjs` | Builds the deployable website and route aliases |
| `.github/workflows/static1.yml` | Builds and deploys the site to GitHub Pages |

## 🚀 Run locally

### Requirements

- [Node.js](https://nodejs.org/) with support for ES modules
- Python 3, or another local static HTTP server

### 1. Clone the repository

```bash
git clone https://github.com/OrpanAp/Custom-web-templating-framework--Power-Engine--simplified.git
cd Custom-web-templating-framework--Power-Engine--simplified
```

### 2. Build the website

```bash
node scripts/build-site.mjs
```

This generates the `_site/` directory. The build script recreates that directory each time it runs.

### 3. Start a local server

```bash
python -m http.server 8000 --directory _site
```

Open **http://localhost:8000** in your browser.

> Do not open `index.html` directly with a `file://` URL. The runtime loads templates using `fetch()`, so the site must be served over HTTP.

## 🧩 Configure a route

Routes are defined in `main.js`. A route can provide a public URL, a fragment path, metadata, and values for template interpolation.

```javascript
{
    href: "/example.html",
    path: "./pages/docs/example.html",
    title: "Example — P.O.W.E.R.",
    description: "A short description for this page.",
    props: {
        frameworkName: "P.O.W.E.R.",
        version: "2.0"
    }
}
```

| Property | Description |
| --- | --- |
| `href` | Browser-facing URL for the route |
| `path` | Path to the HTML fragment used by the route |
| `title` | Document title applied to the route |
| `description` | Meta description applied to the route |
| `props` | Data values available to the fragment's interpolation |

Use paths and URLs that match your deployment setup, and test nested routes after building.

## 🧱 Template examples

### Insert route data

In a template fragment:

```html
<h1>{{ pageTitle }}</h1>
<p>Hello, {{ user.name }}</p>
```

The runtime resolves the placeholders using the route's props. Normal double braces are intended for text values.

### Include a stylesheet

```html
<include type="css" path="assets/css/site.css"></include>
```

### Include a reusable HTML component

```html
<include type="html" path="components/site-footer.html"></include>
```

### Pass props to a component

Every attribute except `type` and `path` becomes a prop for that one include. Inside the component, read it with `{{ name }}` (text is HTML-escaped; `{{{ name }}}` is raw HTML).

```html
<!-- page -->
<include type="html" path="components/site-brand.html" href="#top" brand="P.O.W.E.R. 2.0"></include>

<!-- components/site-brand.html -->
<a class="brand" href="{{ href }}">{{ brand }}</a>
```

Names that are not include props (for example `{{ frameworkName }}`) are left alone and still come from the route's `props`. Attribute names are matched in lower case, because browsers lower-case them.

### Wrap page content in a layout (slots)

Put `<slot></slot>` in a component. Anything written between `<include>` and `</include>` is placed there.

```html
<!-- pages/docs/cli.html -->
<include type="html" path="components/docs-layout.html" crumb="CLI reference">
  <h1>CLI reference</h1>
  <p>Only the content that is different on this page.</p>
</include>

<!-- components/docs-layout.html (shortened) -->
<main class="article">
  <div class="crumb">Documentation / {{ crumb }}</div>
  <slot></slot>
</main>
```

Components can include other components. The active link in `components/docs-nav.html` is marked automatically from the current route, so pages never write `class="active"` themselves.

### Load page-specific JavaScript

```html
<script src="assets/js/pages/example.js"></script>
```

Keep page-specific behavior in a dedicated file under `assets/js/pages/` when practical.

### Raw HTML interpolation

Triple braces, such as `{{{ htmlContent }}}`, are available for raw HTML insertion. This bypasses ordinary text handling and **must not be used with untrusted or user-supplied values**. The current interpolation pipeline is not a complete HTML sanitizer.

## 🌐 Deployment

The repository includes a GitHub Actions workflow at `.github/workflows/static1.yml`.

When changes are pushed to the `master` branch, the workflow:

1. Checks out the repository.
2. Builds the site with `node scripts/build-site.mjs`.
3. Checks for required output files.
4. Uploads the generated `_site/` directory.
5. Deploys the artifact to GitHub Pages.

To use GitHub Pages, make sure Pages is configured to deploy using **GitHub Actions** in the repository's settings. After a successful deployment, open the live demo link at the top of this README. If the link is not available yet, check the repository's **Actions** tab and **Settings → Pages**.

## 🔐 Security and current limitations

Please read these notes before using the runtime beyond a learning project:

- **Authentication is not implemented.** The `authenticate` constructor option is currently a placeholder; it does not protect routes or users.
- **Raw HTML can introduce XSS vulnerabilities.** Never interpolate untrusted values as raw HTML.
- **No script sandbox.** Page scripts execute in the page context and are not isolated by a security boundary.
- **Not a full application framework.** The runtime does not currently provide a complete component lifecycle, route guards, or dynamic route parameters.
- **Test navigation and failure cases.** Verify direct URLs, refreshes, Back/Forward behavior, missing templates, includes, and script loading before deployment.

Do not treat client-side route configuration as an authorization or access-control mechanism.

## 🛣️ Suggested next steps

- Add automated tests for routing, template interpolation, and include failures.
- Add stricter validation and safer handling for template values.
- Document the runtime's public API and supported route options.
- Add a dedicated error-reporting strategy for failed template loads.
- Clearly separate experimental runtime behavior from production security requirements.

## 🔗 Related project

**P.O.W.E.R. 2.0** is the separate Node.js framework documented by this website.

- [P.O.W.E.R. 2.0 repository](https://github.com/OrpanAp/power-2.0)
- [P.O.W.E.R. Engine documentation website](https://orpanap.github.io/Custom-web-templating-framework--Power-Engine--simplified/)

---

<div align="center">

**Built with JavaScript and native browser APIs.**

[Live Demo](https://orpanap.github.io/Custom-web-templating-framework--Power-Engine--simplified/) · [Repository](https://github.com/OrpanAp/Custom-web-templating-framework--Power-Engine--simplified)

</div>
