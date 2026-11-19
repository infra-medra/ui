import { Component, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { DialogComponent } from '@medra.dev/ui';

import { loadSearchIndex } from '../search/search-loader';
import { searchEntries, type SearchEntry } from '../search/search-match';
import { SearchState } from './search-state';

const RESULT_LIMIT = 20;

/**
 * Global search (SITE-012). The query and every result are rendered through Angular
 * interpolation only (M-04), the query never reaches the URL, storage or the network
 * (M-05), and navigation goes through `Router.navigateByUrl` with an index URL that was
 * validated by `search-match` (M-02).
 */
@Component({
  selector: 'app-search-dialog',
  imports: [DialogComponent],
  template: `
    <med-dialog [(visible)]="state.open" header="Search" position="top" class="w-full max-w-xl">
      <input
        type="text"
        role="combobox"
        cdkFocusInitial
        autofocus
        autocomplete="off"
        spellcheck="false"
        aria-label="Search the documentation"
        aria-autocomplete="list"
        aria-controls="site-search-results"
        [attr.aria-expanded]="results().length > 0"
        [attr.aria-activedescendant]="results().length > 0 ? 'site-search-option-' + activeIndex() : null"
        [value]="query()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        placeholder="Search components and sections"
        class="w-full rounded-md border border-surface-300 bg-transparent px-3 py-2 font-body text-sm dark:border-surface-700"
      />
      <ul id="site-search-results" role="listbox" aria-label="Search results" class="mt-3 max-h-80 overflow-auto font-body text-sm">
        @for (result of results(); track result.url; let i = $index) {
          <li
            role="option"
            [id]="'site-search-option-' + i"
            [attr.aria-selected]="i === activeIndex()"
            (click)="go(result)"
            (mouseenter)="activeIndex.set(i)"
            class="flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2"
            [class.bg-brand-50]="i === activeIndex()"
            [class.dark:bg-surface-800]="i === activeIndex()"
          >
            <span>{{ result.title }}</span>
            <span class="text-xs text-surface-500 dark:text-surface-400">{{ result.group }}</span>
          </li>
        }
      </ul>
    </med-dialog>
  `,
})
export class SearchDialog {
  protected readonly state = inject(SearchState);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  private readonly entries = signal<SearchEntry[]>([]);
  private loading = false;
  private loaded = false;

  protected readonly results = computed(() => searchEntries(this.entries(), this.query(), RESULT_LIMIT));

  constructor() {
    effect(() => {
      if (this.state.open()) {
        untracked(() => {
          this.query.set('');
          this.activeIndex.set(0);
          void this.ensureIndex();
        });
      }
    });
  }

  /** Ctrl+K, or Cmd+K on macOS, opens the dialog from anywhere on the site. */
  @HostListener('document:keydown', ['$event'])
  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.state.open.set(true);
    }
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set(Math.min(this.activeIndex() + 1, Math.max(count - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
    } else if (event.key === 'Enter') {
      const target = this.results()[this.activeIndex()];
      if (target) {
        event.preventDefault();
        this.go(target);
      }
    }
  }

  protected go(entry: SearchEntry): void {
    this.state.open.set(false);
    void this.router.navigateByUrl(entry.url);
  }

  private async ensureIndex(): Promise<void> {
    if (this.loaded || this.loading) return;
    this.loading = true;
    this.entries.set(await loadSearchIndex());
    this.loading = false;
    this.loaded = true;
  }
}
