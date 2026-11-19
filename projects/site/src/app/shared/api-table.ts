import { Component, computed, input } from '@angular/core';
import type { ApiEntry } from './api-entry';

const GROUPS: readonly { title: string; kinds: readonly ApiEntry['kind'][] }[] = [
  { title: 'Inputs', kinds: ['input', 'model', 'option'] },
  { title: 'Outputs', kinds: ['output'] },
  { title: 'Templates', kinds: ['template'] },
  { title: 'Methods', kinds: ['method'] },
];

@Component({
  selector: 'app-api-table',
  template: `
    @for (group of groups(); track group.title) {
      <h3 class="mt-6 mb-2 font-body text-sm font-semibold text-surface-900 first:mt-0 dark:text-surface-50">{{ group.title }}</h3>
      <div class="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-50 font-body text-surface-500 dark:bg-surface-900 dark:text-surface-400">
            <tr>
              <th class="px-4 py-2 font-medium">Name</th>
              <th class="px-4 py-2 font-medium">Type / signature</th>
              <th class="px-4 py-2 font-medium">Default</th>
              <th class="px-4 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-200 font-body dark:divide-surface-800">
            @for (entry of group.entries; track entry.name) {
              <tr>
                <td class="px-4 py-2 font-mono text-xs whitespace-nowrap text-surface-900 dark:text-surface-50">{{ entry.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-brand-600 dark:text-brand-400">
                  {{ entry.kind === 'method' ? entry.signature : entry.type }}
                </td>
                <td class="px-4 py-2 font-mono text-xs whitespace-nowrap text-surface-500 dark:text-surface-400">
                  {{ entry.kind === 'method' ? '—' : (entry.default ?? '—') }}
                </td>
                <td class="px-4 py-2 text-surface-600 dark:text-surface-400">{{ entry.description ?? '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class ApiTableComponent {
  readonly entries = input.required<ApiEntry[]>();

  /** Entries split by type, in display order; a type with no entries has no group. */
  protected readonly groups = computed(() =>
    GROUPS.map(({ title, kinds }) => ({ title, entries: this.entries().filter((e) => kinds.includes(e.kind)) })).filter(
      (group) => group.entries.length > 0,
    ),
  );
}
