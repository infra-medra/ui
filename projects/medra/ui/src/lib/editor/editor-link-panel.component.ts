import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';

/**
 * Internal overlay content for `EditorComponent`'s link-insertion toolbar
 * button (not part of the public API) — the "own small accessible input UI
 * (a URL prompt)" the component's class doc already called for as the
 * reason link insertion wasn't in the v1 toolbar. A plain connected
 * overlay (same `OverlayService.openConnected` + `SELECT_PANEL_CLASS`
 * chrome as Select/DatePicker) rather than a native `window.prompt()`: the
 * latter is a blocking, unstyleable browser dialog that can't be exercised
 * the same way in tests as everything else in this library.
 */
@Component({
  selector: 'med-editor-link-panel',
  standalone: true,
  imports: [ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <form class="flex items-center gap-2 p-2" (submit)="onSubmit($event)">
      <input
        #urlInput
        type="url"
        inputmode="url"
        class="w-56 rounded-sm border border-surface-300 bg-transparent px-2 py-1 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-surface-600 dark:text-surface-50 dark:placeholder:text-surface-500"
        [placeholder]="urlPlaceholder()"
        [attr.aria-label]="urlLabel()"
        [value]="url()"
        (input)="url.set($any($event.target).value)"
        (keydown.escape)="cancelled.emit()"
      />
      <button type="submit" medButton size="sm" [disabled]="!url().trim()">{{ insertLabel() }}</button>
      <button type="button" medButton variant="text" severity="secondary" size="sm" (click)="cancelled.emit()">{{ cancelLabel() }}</button>
    </form>
  `,
})
export class EditorLinkPanelComponent implements AfterViewInit {
  readonly urlPlaceholder = input('https://example.com');
  readonly urlLabel = input('Link URL');
  readonly insertLabel = input('Insert');
  readonly cancelLabel = input('Cancel');

  protected readonly url = signal('');
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  private readonly urlInputRef = viewChild<ElementRef<HTMLInputElement>>('urlInput');

  ngAfterViewInit(): void {
    this.urlInputRef()?.nativeElement.focus();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.url().trim();
    if (value) {
      this.confirmed.emit(value);
    }
  }
}
