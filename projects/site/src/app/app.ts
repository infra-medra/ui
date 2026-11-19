import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SearchDialog } from './shell/search-dialog';
import { SiteHeader } from './shell/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SearchDialog],
  template: `
    <div class="flex min-h-screen flex-col bg-surface-0 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
      <app-site-header />
      <app-search-dialog />

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="border-t border-surface-200 py-8 font-body text-xs text-surface-500 dark:border-surface-800 dark:text-surface-400">
        <div class="px-6">
          <p>
            MedraUi is free and open source software, released under the MIT license.
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class App {}
