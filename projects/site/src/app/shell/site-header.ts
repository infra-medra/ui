import { Component, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import libraryPackage from '../../../../medra/ui/package.json';
import { MobileNav } from './mobile-nav';
import { SearchState } from './search-state';
import { itemUrl, sectionForUrl, visibleSections } from '../nav/site-nav';

// Also read by the inline script in `index.html`, which applies the scheme before first paint.
const DARK_MODE_STORAGE_KEY = 'medraui-color-scheme';
const GITHUB_URL = 'https://github.com/infra-medra/medraui';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="border-b border-surface-200 dark:border-surface-800">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        @if (activeSection()) {
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            (click)="mobileNav.open.set(true)"
            class="rounded-md border border-surface-300 px-3 py-1.5 font-body text-xs lg:hidden dark:border-surface-700"
          >
            Menu
          </button>
        }

        <a routerLink="/" class="shrink-0" aria-label="MedraUi home">
          <img src="/brand/lockup.svg" alt="MedraUi" class="block h-8 w-auto dark:hidden" />
          <img src="/brand/lockup-inverted.svg" alt="MedraUi" class="hidden h-8 w-auto dark:block" />
        </a>

        <nav aria-label="Sections" class="flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-sm font-medium">
          @for (section of sections; track section.id) {
            <a
              [routerLink]="section.url"
              [attr.aria-current]="section.id === activeSection() ? 'page' : null"
              [class.text-brand-600]="section.id === activeSection()"
              [class.dark:text-brand-400]="section.id === activeSection()"
              class="hover:text-brand-600 dark:hover:text-brand-400"
            >
              {{ section.label }}
            </a>
          }
        </nav>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-xs">
          <span data-testid="site-version" class="text-surface-500 dark:text-surface-400">v{{ version }}</span>
          <a
            [href]="githubUrl"
            rel="noopener noreferrer"
            class="hover:text-brand-600 dark:hover:text-brand-400"
            aria-label="MedraUi on GitHub"
          >
            GitHub
          </a>
          <button
            type="button"
            aria-label="Search"
            aria-haspopup="dialog"
            (click)="searchState.open.set(true)"
            class="rounded-md border border-surface-300 px-3 py-1.5 dark:border-surface-700"
          >
            Search
          </button>
          <button
            type="button"
            (click)="toggleDarkMode()"
            class="rounded-md border border-surface-300 px-3 py-1.5 dark:border-surface-700"
            [attr.aria-pressed]="isDark()"
          >
            {{ isDark() ? 'Light mode' : 'Dark mode' }}
          </button>
        </div>
      </div>
    </header>
  `,
})
export class SiteHeader {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  protected readonly mobileNav = inject(MobileNav);
  protected readonly searchState = inject(SearchState);

  protected readonly version: string = libraryPackage.version;
  protected readonly githubUrl = GITHUB_URL;
  protected readonly isDark = signal(false);

  /** Published sections, each linking to its first page. */
  protected readonly sections = visibleSections().map((section) => {
    const first = section.groups.flatMap((g) => g.items)[0];
    return { id: section.id, label: section.label, url: itemUrl(section, first) };
  });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly activeSection = computed(() => sectionForUrl(this.currentUrl()));

  constructor() {
    // Prerendering runs this on the server too; `localStorage`/`matchMedia`
    // don't exist there, so the preference read stays browser-only.
    if (this.isBrowser) {
      afterNextRender(() => {
        const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyDarkMode(stored ? stored === 'dark' : prefersDark);
      });
    }
  }

  protected toggleDarkMode(): void {
    this.applyDarkMode(!this.isDark());
    localStorage.setItem(DARK_MODE_STORAGE_KEY, this.isDark() ? 'dark' : 'light');
  }

  private applyDarkMode(dark: boolean): void {
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
  }
}
