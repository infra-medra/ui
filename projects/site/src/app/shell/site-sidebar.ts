import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

import { SECTIONS, filterGroups, itemUrl, sectionForUrl } from '../nav/site-nav';

@Component({
  selector: 'app-site-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Sidebar" class="flex min-h-0 flex-1 flex-col gap-4 font-body text-sm">
      <input
        type="search"
        aria-label="Filter {{ section()?.label ?? 'items' }}"
        placeholder="Filter…"
        autocomplete="off"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        class="w-full rounded-md border border-surface-300 bg-transparent px-2 py-1.5 text-sm dark:border-surface-700"
      />

      <div class="flex flex-col gap-3 overflow-y-auto">
        @for (group of groups(); track group.label; let i = $index) {
          <div>
            <button
              type="button"
              [attr.aria-expanded]="isExpanded(group.label)"
              [attr.aria-controls]="'sidebar-group-' + i"
              (click)="toggle(group.label)"
              class="mb-1 flex w-full items-center justify-between text-xs font-semibold tracking-wide text-surface-500 uppercase dark:text-surface-400"
            >
              <span>{{ group.label }}</span>
              <span aria-hidden="true">{{ isExpanded(group.label) ? '−' : '+' }}</span>
            </button>
            <div [id]="'sidebar-group-' + i" class="flex flex-col gap-1" [hidden]="!isExpanded(group.label)">
              @for (item of group.items; track item.slug) {
                <a
                  [routerLink]="urlOf(item)"
                  routerLinkActive="text-brand-600 dark:text-brand-400 font-medium"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="rounded-md px-2 py-1 text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  {{ item.label }}
                </a>
              }
            </div>
          </div>
        } @empty {
          <p class="px-2 text-surface-500 dark:text-surface-400" role="status">No items found.</p>
        }
      </div>
    </nav>
  `,
})
export class SiteSidebar {
  private readonly router = inject(Router);

  protected readonly query = signal('');
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly section = computed(() => {
    const id = sectionForUrl(this.currentUrl());
    return SECTIONS.find((s) => s.id === id) ?? null;
  });

  protected readonly groups = computed(() => filterGroups(this.section()?.groups ?? [], this.query()));

  /** While filtering, matching groups stay open so results are never hidden. */
  protected isExpanded(label: string): boolean {
    return this.query().trim() !== '' || !this.collapsed().has(label);
  }

  protected toggle(label: string): void {
    const next = new Set(this.collapsed());
    if (!next.delete(label)) next.add(label);
    this.collapsed.set(next);
  }

  protected urlOf(item: { slug: string; label: string; url?: string }): string {
    const section = this.section();
    return section ? itemUrl(section, item) : '/docs';
  }
}
