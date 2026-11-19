import { Component, DestroyRef, PLATFORM_ID, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { resolveStatus } from '../nav/component-status';

export interface DocPart {
  readonly id: string;
  readonly label: string;
}

/** The parts every component page shows, in order. */
export const COMPONENT_DOC_PARTS: readonly DocPart[] = [
  { id: 'examples', label: 'Examples' },
  { id: 'api-reference', label: 'API reference' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'theming', label: 'Theming' },
];

/** Fraction of the viewport height below which a section top no longer counts as "reached". */
const SPY_LINE = 0.6;

/**
 * Common layout for `/docs/components/<slug>` pages: title with status badge,
 * anchored sections (Examples, API reference, Accessibility, Theming) and an
 * "On this page" index that follows the reading position. A page can pass its own
 * `examples` (anchor id and label each); they are listed nested under Examples.
 *
 * Projection: default content is the Examples part; `[api]` content is the
 * API reference part. Accessibility and Theming show shared library-wide text.
 */
@Component({
  selector: 'app-component-doc',
  imports: [RouterLink],
  template: `
    <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-10">
      <article class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-display text-3xl font-medium text-surface-900 dark:text-surface-50">{{ title() }}</h1>
          <span
            data-testid="status-badge"
            class="rounded-full border border-surface-300 px-2 py-0.5 text-xs font-medium text-surface-700 dark:border-surface-600 dark:text-surface-200"
            >{{ status() }}</span
          >
        </div>

        <section id="examples" class="scroll-mt-24">
          <h2 class="sr-only">Examples</h2>
          <ng-content />
        </section>

        <section id="api-reference" class="scroll-mt-24">
          <h2 class="mt-16 mb-3 font-display text-xl font-medium text-surface-900 dark:text-surface-50">API reference</h2>
          <ng-content select="[api]" />
        </section>

        <section id="accessibility" class="scroll-mt-24">
          <h2 class="mt-16 mb-3 font-display text-xl font-medium text-surface-900 dark:text-surface-50">Accessibility</h2>
          <p class="text-surface-700 dark:text-surface-200">
            MedraUi components follow WAI-ARIA authoring practices for keyboard operation, focus management and
            accessible names. See the
            <a class="underline" href="/docs/foundations/accessibility">Accessibility foundations</a> for the shared
            guidance.
          </p>
        </section>

        <section id="theming" class="scroll-mt-24">
          <h2 class="mt-16 mb-3 font-display text-xl font-medium text-surface-900 dark:text-surface-50">Theming</h2>
          <p class="text-surface-700 dark:text-surface-200">
            Components read their colors, spacing and radii from design tokens, so one theme change restyles the whole
            library. See the <a class="underline" href="/docs/foundations/theming">Theming foundations</a> for how to
            customize them.
          </p>
        </section>
      </article>

      <nav aria-label="On this page" class="hidden lg:block">
        <ul class="sticky top-24 space-y-2 text-sm">
          @for (part of parts; track part.id) {
            <li>
              <a
                [routerLink]="[]"
                [fragment]="part.id"
                [attr.aria-current]="current() === part.id ? 'true' : null"
                class="text-surface-600 hover:text-surface-900 aria-[current=true]:font-medium aria-[current=true]:text-primary-600 dark:text-surface-300 dark:hover:text-surface-50"
                (click)="current.set(part.id)"
                >{{ part.label }}</a
              >
              @if (part.id === 'examples' && examples().length > 0) {
                <ul class="mt-2 ml-3 space-y-2 border-l border-surface-200 pl-3 dark:border-surface-700">
                  @for (example of examples(); track example.id) {
                    <li>
                      <a
                        [routerLink]="[]"
                        [fragment]="example.id"
                        [attr.aria-current]="current() === example.id ? 'true' : null"
                        class="text-surface-600 hover:text-surface-900 aria-[current=true]:font-medium aria-[current=true]:text-primary-600 dark:text-surface-300 dark:hover:text-surface-50"
                        (click)="current.set(example.id)"
                        >{{ example.label }}</a
                      >
                    </li>
                  }
                </ul>
              }
            </li>
          }
        </ul>
      </nav>
    </div>
  `,
})
export class ComponentDocComponent {
  /** Page title shown in the single `<h1>`. */
  readonly title = input.required<string>();
  /** Component slug, used to look up the status badge. */
  readonly slug = input.required<string>();
  /** Optional examples of the page, listed nested under Examples. Each `id` is the anchor id of the example's block. */
  readonly examples = input<readonly DocPart[]>([]);

  protected readonly parts = COMPONENT_DOC_PARTS;
  protected readonly status = computed(() => resolveStatus(this.slug()));
  protected readonly current = signal<string>(COMPONENT_DOC_PARTS[0].id);
  /** Every anchor the reading position can match, in page order: Examples, its examples, then the other parts. */
  private readonly anchorIds = computed(() => [
    COMPONENT_DOC_PARTS[0].id,
    ...this.examples().map((example) => example.id),
    ...COMPONENT_DOC_PARTS.slice(1).map((part) => part.id),
  ]);

  constructor() {
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isBrowser) return;
      const update = () => {
        const line = window.innerHeight * SPY_LINE;
        let active = COMPONENT_DOC_PARTS[0].id;
        for (const id of this.anchorIds()) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= line) active = id;
        }
        this.current.set(active);
      };
      window.addEventListener('scroll', update, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', update));
    });
  }
}
