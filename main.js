import App from "./runtime/App.js";

/* Values every page can use as {{ name }} */
const siteProps = {
  frameworkName: "P.O.W.E.R.",
  version: "2.0",
  engineName: "Progressively Optimized Web Engine for Rendering",
};

/* POWER 1.0 pages show their own name and version */
const power1Props = {
  ...siteProps,
  frameworkName: "P.O.W.E.R. Engine",
  version: "1.0",
};

/* A documentation page. The address is built from the file's folder, so
   ./pages/docs/power-2/cli.html  ->  /docs/power-2/cli.html
   ./pages/docs/power-2/index.html -> /docs/power-2/
   Folder = version. To add POWER 3.0: make pages/docs/power-3/ and add its pages below. */
const docsPage = (path, { title, description, props = siteProps }) => ({
  href: path.replace("./pages", "").replace(/index\.html$/, ""),
  path,
  title,
  description,
  props,
});

/* An old address that now lives somewhere else. */
const movedTo = (href, redirect) => ({ href, redirect });

const app = new App({
  root: document.getElementById("app"),

  routes: {
    home: {
      href: "/",
      path: "./pages/home/index.html",
      title: "P.O.W.E.R. 2.0 — Build with intent.",
      description:
        "Explore P.O.W.E.R. 2.0, its capabilities, quick start, documentation, and source code.",
      props: siteProps,
    },

    /* ---------- POWER 2.0 docs: pages/docs/power-2/ ---------- */
    "power-2": docsPage("./pages/docs/power-2/index.html", {
      title: "Documentation — P.O.W.E.R. 2.0",
      description:
        "The main documentation index for the P.O.W.E.R. 2.0 Node.js web framework.",
    }),
    "power-2/quick-start": docsPage("./pages/docs/power-2/quick-start.html", {
      title: "Quick Start — P.O.W.E.R. 2.0",
      description:
        "Install, configure, and run your first P.O.W.E.R. 2.0 application.",
    }),
    "power-2/cli": docsPage("./pages/docs/power-2/cli.html", {
      title: "CLI Reference — P.O.W.E.R. 2.0",
      description:
        "Explore the P.O.W.E.R. 2.0 command-line interface and developer commands.",
    }),
    "power-2/deployment": docsPage("./pages/docs/power-2/deployment.html", {
      title: "Deployment — P.O.W.E.R. 2.0",
      description:
        "Deployment setup and production considerations for P.O.W.E.R. 2.0 applications.",
    }),
    "power-2/architecture": docsPage(
      "./pages/docs/power-2/architecture.html",
      {
        title: "Architecture — P.O.W.E.R. 2.0",
        description:
          "Understand the architecture and major application layers in P.O.W.E.R. 2.0.",
      },
    ),
    "power-2/configuration": docsPage(
      "./pages/docs/power-2/configuration.html",
      {
        title: "Configuration — P.O.W.E.R. 2.0",
        description:
          "Configuration options and environment setup for P.O.W.E.R. 2.0.",
      },
    ),
    "power-2/database": docsPage("./pages/docs/power-2/database.html", {
      title: "Database Guide — P.O.W.E.R. 2.0",
      description:
        "Database configuration and integration guidance for P.O.W.E.R. 2.0.",
    }),
    "power-2/routing": docsPage("./pages/docs/power-2/routing.html", {
      title: "Routing — P.O.W.E.R. 2.0",
      description: "Route definitions and request handling in P.O.W.E.R. 2.0.",
    }),
    "power-2/security": docsPage("./pages/docs/power-2/security.html", {
      title: "Security — P.O.W.E.R. 2.0",
      description:
        "Security practices and configuration notes for P.O.W.E.R. 2.0 applications.",
    }),

    /* ---------- POWER 1.0 docs: pages/docs/power-1/ ---------- */
    "power-1": docsPage("./pages/docs/power-1/index.html", {
      title: "POWER Engine 1.0 — Source Documentation",
      description:
        "A source-oriented guide to POWER Engine 1.0 routing, templates, props, includes, and page scripts.",
      props: power1Props,
    }),

    /* ---------- Old addresses (before docs were split by version) ---------- */
    "old-docs": movedTo("/docs", "/docs/power-2/"),
    "old-docs-html": movedTo("/docs.html", "/docs/power-2/"),
    "old-quick-start": movedTo("/quick-start.html", "/docs/power-2/quick-start.html"),
    "old-cli": movedTo("/cli.html", "/docs/power-2/cli.html"),
    "old-deployment": movedTo("/deployment.html", "/docs/power-2/deployment.html"),
    "old-architecture": movedTo("/architecture.html", "/docs/power-2/architecture.html"),
    "old-configuration": movedTo("/configuration.html", "/docs/power-2/configuration.html"),
    "old-database": movedTo("/database.html", "/docs/power-2/database.html"),
    "old-routing": movedTo("/routing.html", "/docs/power-2/routing.html"),
    "old-security": movedTo("/security.html", "/docs/power-2/security.html"),
    "old-power-1": movedTo("/power-1-docs.html", "/docs/power-1/"),

    404: {
      href: "/404",
      path: "./pages/errors/not-found.html",
      title: "Page Not Found — P.O.W.E.R.",
      description: "The requested P.O.W.E.R. page could not be found.",
      props: siteProps,
    },
  },

  authenticate: {},
});

app.Run().catch((error) => {
  console.error("POWER Engine could not render this page:", error);
  const root = document.getElementById("app");
  if (root) {
    root.innerHTML =
      '<main style="max-width:760px;margin:4rem auto;padding:1.5rem;font-family:system-ui"><h1>POWER Engine could not load this page</h1><p>Check the browser console and confirm the page template is available.</p></main>';
  }
});
