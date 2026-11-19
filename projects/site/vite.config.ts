/// <reference types="vitest" />

import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tailwindcss from '@tailwindcss/vite';
import { SECTIONS, itemUrl } from './src/app/nav/site-nav';

/**
 * Prerender list derived from the navigation model, so a page registered in
 * `site-nav.ts` is always emitted.
 */
function prerenderRoutes(): string[] {
  const routes = new Set<string>(['/', '/docs']);
  for (const section of SECTIONS) {
    for (const group of section.groups) {
      for (const item of group.items) {
        routes.add(itemUrl(section, item));
        // An item with a custom `url` (Introduction -> /docs) still has its own page under the section.
        if (item.url && section.basePath) routes.add(`${section.basePath}/${item.slug}`);
      }
    }
  }
  return [...routes];
}

const DEVTOOLS_PROBE_PATH = '/.well-known/appspecific/com.chrome.devtools.json';

/**
 * Chrome DevTools probes `DEVTOOLS_PROBE_PATH` automatically whenever it's
 * open against a local dev server, looking for optional workspace-folder
 * config — this project has none to offer, so an empty object is the
 * correct response (Chrome's own recommendation).
 *
 * Not a Nitro `server/routes/**` handler: Analog's dev-server middleware
 * (`@analogjs/vite-plugin-nitro`) only forwards requests under the `api`
 * prefix to Nitro during `vite dev` (`configureServer`'s own
 * `req.url?.startsWith(prefix + apiPrefix)` check) — anything else,
 * `nitro.handlers` config included, never reaches Nitro's dev server and
 * falls straight through to Analog's Angular-SSR catch-all, which has no
 * matching route and throws a noisy NG04002 on every DevTools open. A
 * plain Vite dev middleware, registered ahead of `analog()` in the plugins
 * array so it runs before that catch-all, is the only thing that can
 * intercept a non-`/api` path in dev mode. Dev-only is sufficient: this
 * site's production build is served as fully static prerendered files
 * (`serve dist/analog/public`, see `package.json`'s `preview` script), so
 * a real visitor's browser only ever gets a plain static 404 for this
 * path — the SPA's client-side router never runs for a background
 * `fetch()` DevTools makes, only for an actual navigation.
 */
function devtoolsProbePlugin(): Plugin {
  return {
    name: 'devtools-probe-stub',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === DEVTOOLS_PROBE_PATH) {
          res.setHeader('Content-Type', 'application/json');
          res.end('{}');
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
    // Resolves the "@medra.dev/ui" import to `../../dist/medra/ui` (see tsconfig.json),
    // the same alias @angular/build already honors for the showcase app.
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ['@angular/cdk'],
  },
  plugins: [
    devtoolsProbePlugin(),
    analog({
      // Real SSR at build time (not just an empty client shell) so
      // prerendered pages carry actual HTML content — needed both for SEO
      // (plano-go-to-market.md's #1 acquisition channel is organic search)
      // and because this site's docs content is meant to later double as
      // the source for a RAG support assistant (decisoes-produto.md).
      ssr: true,
      static: true,
      prerender: {
        routes: prerenderRoutes(),
      },
    }),
    tailwindcss()
  ],
}));
