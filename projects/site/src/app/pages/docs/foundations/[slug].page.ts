import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import type { RouteMeta } from '@analogjs/router';
import { isFoundationsSlug } from '../../../nav/site-nav';
import { ProseComponent } from '../../../shared/prose';

export const routeMeta: RouteMeta = {
  title: 'Foundations — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Foundations of MedraUi: brand identity, design tokens, theming, accessibility, internationalization, overlays and forms.',
    },
  ],
};

/** Every Foundations page, keyed by file path; the slug is only ever used to look up a key built here. */
const PAGES: Record<string, string> = import.meta.glob('../../../../content/docs/foundations-*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const CONTENT_BY_SLUG = new Map<string, string>(
  Object.entries(PAGES).map(([path, text]) => [path.replace(/^.*\/foundations-/, '').replace(/\.txt$/, ''), text]),
);

@Component({
  selector: 'app-docs-foundations',
  imports: [ProseComponent, RouterLink],
  template: `
    @if (content(); as text) {
      <app-prose [content]="text" />
    } @else {
      <div>
        <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">Page not found</h1>
        <p class="mt-4 text-surface-600 dark:text-surface-400">
          There is no Foundations page at this address.
          <a routerLink="/docs/foundations/brand-identity" class="text-brand-600 underline dark:text-brand-400">Go to Foundations</a>.
        </p>
      </div>
    }
  `,
})
export default class FoundationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('slug') ?? '',
  });

  /** Markdown of the page, or `null` for any slug outside the `site-nav.ts` allowlist (M-08). */
  protected readonly content = computed(() => {
    const slug = this.slug();
    return isFoundationsSlug(slug) ? (CONTENT_BY_SLUG.get(slug) ?? null) : null;
  });
}
