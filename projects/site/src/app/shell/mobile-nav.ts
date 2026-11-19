import { Injectable, signal } from '@angular/core';

/**
 * Open state of the mobile navigation drawer (SITE-011). The header owns the
 * menu control and the docs layout owns the drawer, so both share this signal.
 */
@Injectable({ providedIn: 'root' })
export class MobileNav {
  readonly open = signal(false);
}
