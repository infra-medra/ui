import { Injectable, signal } from '@angular/core';

/** Open state of the global search dialog, shared by the header control and the dialog itself. */
@Injectable({ providedIn: 'root' })
export class SearchState {
  readonly open = signal(false);
}
