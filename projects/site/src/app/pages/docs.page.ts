import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerComponent } from '@medra/ui';

import { MobileNav } from '../shell/mobile-nav';
import { SiteSidebar } from '../shell/site-sidebar';

@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, SiteSidebar, DrawerComponent],
  template: `
    <div class="flex gap-12 px-6 py-12">
      <aside
        class="sticky top-4 hidden max-h-[calc(100dvh-2rem)] w-48 shrink-0 flex-col self-start lg:flex [&_nav>div]:min-h-0 [&_nav>div]:flex-1"
      >
        <app-site-sidebar class="flex min-h-0 flex-1 flex-col" />
      </aside>

      <div class="min-w-0 flex-1">
        <router-outlet />
      </div>
    </div>

    <med-drawer [(visible)]="mobileNav.open" position="left" header="Navigation" class="lg:hidden">
      <app-site-sidebar />
    </med-drawer>
  `,
})
export default class DocsLayout {
  protected readonly mobileNav = inject(MobileNav);
}
