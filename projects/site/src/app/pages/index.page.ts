import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { RouteMeta } from '@analogjs/router';
import { ButtonDirective } from '@medra/ui';

export const routeMeta: RouteMeta = {
  title: 'MedraUi — Angular components built for teams that build to last',
  meta: [
    {
      name: 'description',
      content:
        'Signals-first, standalone Angular components styled entirely in Tailwind. Free and open source under the MIT license.',
    },
  ],
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonDirective],
  template: `
    <!-- Hero -->
    <section class="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
      <h1 class="font-display text-4xl font-medium tracking-tight text-surface-900 sm:text-5xl dark:text-surface-50">
        Angular components built for teams that build to last.
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-lg text-surface-600 dark:text-surface-400">
        Signals-first, 100% standalone, styled entirely in Tailwind — the components you already
        knew how to use, rebuilt for how Angular works today.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a medButton size="lg" routerLink="/docs">Browse the docs</a>
      </div>
    </section>

    <!-- Signal-first rewrite -->
    <section class="border-y border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900">
      <div class="mx-auto max-w-3xl px-6 py-12 text-center">
        <h2 class="font-display text-xl font-medium text-surface-900 dark:text-surface-50">
          Rewritten from scratch with a signal-first approach.
        </h2>
        <p class="mt-3 text-surface-600 dark:text-surface-400">
          Every component was rewritten around Angular signals and standalone APIs, instead of
          carrying forward an older, zone-based design.
        </p>
      </div>
    </section>

    <!-- Open source -->
    <section class="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 class="font-display text-2xl font-medium text-surface-900 dark:text-surface-50">Free and open source.</h2>
      <p class="mx-auto mt-3 max-w-xl text-surface-600 dark:text-surface-400">
        MedraUi is released under the MIT license. Install it, build your whole app, and ship it
        anywhere — no license key, no trial countdown, no per-host or per-developer fees.
      </p>
    </section>

    <!-- Three pillars -->
    <section class="border-t border-surface-200 dark:border-surface-800">
      <div class="mx-auto max-w-5xl px-6 py-16">
        <div class="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 class="font-display text-lg font-medium text-surface-900 dark:text-surface-50">
              Built for the Angular you use today
            </h3>
            <p class="mt-2 text-sm text-surface-600 dark:text-surface-400">
              Signals-first, standalone, zoneless-ready from v1 — not an older base with signals
              bolted on. Styled natively in Tailwind, with no proprietary theming engine to learn.
            </p>
          </div>
          <div>
            <h3 class="font-display text-lg font-medium text-surface-900 dark:text-surface-50">Open and community-maintained</h3>
            <p class="mt-2 text-sm text-surface-600 dark:text-surface-400">
              Developed in the open under the MIT license, with issues and contributions welcome.
            </p>
          </div>
          <div>
            <h3 class="font-display text-lg font-medium text-surface-900 dark:text-surface-50">Yours to use and change</h3>
            <p class="mt-2 text-sm text-surface-600 dark:text-surface-400">
              MIT-licensed: use it in commercial and personal projects, fork it, and adapt it —
              with no limit on apps, hosts, or developers.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="border-t border-surface-200 dark:border-surface-800">
      <div class="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 class="font-display text-2xl font-medium text-surface-900 dark:text-surface-50">See what's documented so far</h2>
        <p class="mx-auto mt-3 max-w-xl text-surface-600 dark:text-surface-400">
          Component coverage is rolling out gradually — Button, Checkbox, InputText, Dialog, and
          Message/Toast are documented today, with the rest of the library following.
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a medButton size="lg" routerLink="/docs">Browse the docs</a>
        </div>
      </div>
    </section>
  `,
})
export default class Home {}
