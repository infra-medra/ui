import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { GlobalOverlayPosition, OverlayService, OverlayTemplateHandle } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';

let nextDeclarativeDialogId = 0;

/**
 * Declarative Dialog component (`DLG-01`), complementing `DialogService`.
 * Uses `OverlayService.openGlobalTemplate()` and Angular template interpolation
 * / `NgTemplateOutlet` (`M-03`, no `[innerHTML]` or `bypassSecurityTrust*`).
 */
@Component({
  selector: 'med-dialog',
  standalone: true,
  imports: [ButtonDirective, IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'hidden' },
  template: `
    <ng-template #panelTemplate>
      <div
        [class]="panelClass()"
        role="dialog"
        [attr.aria-modal]="modal() ? 'true' : null"
        [attr.aria-labelledby]="header() ? headerId : null"
        [attr.data-maximized]="maximized() ? 'true' : null"
        [style.width]="maximized() ? 'calc(100vw - 2rem)' : null"
        [style.height]="maximized() ? 'calc(100vh - 2rem)' : null"
        [style.maxWidth]="maximized() ? 'none' : null"
        [style.maxHeight]="maximized() ? 'none' : null"
      >
        @if (headlessTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else {
          @if (headerTemplate() || header() || closable() || maximizable()) {
            <div class="flex items-center justify-between gap-4 border-b border-surface-200 px-5 py-4 dark:border-surface-700">
              <div class="flex min-w-0 flex-1 items-center gap-2">
                @if (headerTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" />
                }
                @if (header()) {
                  <h2 [id]="headerId" class="min-w-0 flex-1 break-words text-lg font-semibold text-surface-900 dark:text-surface-0">
                    {{ header() }}
                  </h2>
                }
              </div>
              <div class="flex shrink-0 items-center gap-1">
                @if (maximizable()) {
                  <button
                    medButton
                    type="button"
                    variant="text"
                    severity="secondary"
                    iconOnly
                    [attr.aria-label]="maximized() ? restoreLabel() : maximizeLabel()"
                    (click)="toggleMaximize()"
                  >
                    <med-icon [name]="maximized() ? 'arrows-pointing-in' : 'arrows-pointing-out'" />
                  </button>
                }
                @if (closable()) {
                  <button
                    medButton
                    type="button"
                    variant="text"
                    severity="secondary"
                    iconOnly
                    [attr.aria-label]="closeLabel()"
                    (click)="close()"
                  >
                    <med-icon name="x-mark" />
                  </button>
                }
              </div>
            </div>
          }
          <div class="flex-1 overflow-auto p-5">
            <ng-content />
          </div>
          @if (footerTemplate(); as tpl) {
            <div class="border-t border-surface-200 px-5 py-3 dark:border-surface-700">
              <ng-container [ngTemplateOutlet]="tpl" />
            </div>
          }
        }
      </div>
    </ng-template>
  `,
})
export class DialogComponent implements OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTemplate = viewChild.required('panelTemplate', { read: TemplateRef });

  protected readonly headerTemplate = contentChild('header', { read: TemplateRef });
  protected readonly footerTemplate = contentChild('footer', { read: TemplateRef });
  protected readonly headlessTemplate = contentChild('headless', { read: TemplateRef });

  readonly visible = model(false);
  readonly header = input<string | null>(null);
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closeLabel = input('Close');
  readonly position = input<GlobalOverlayPosition>('center');
  readonly draggable = input(false, { transform: booleanAttribute });
  readonly resizable = input(false, { transform: booleanAttribute });
  readonly maximizable = input(false, { transform: booleanAttribute });
  readonly maximizeLabel = input('Maximize');
  readonly restoreLabel = input('Restore');
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly dismissableMask = input(true, { transform: booleanAttribute });
  /** Renders the dialog as modal with a backdrop, focus trap, and `aria-modal="true"`. Default: `true`. */
  readonly modal = input(true, { transform: booleanAttribute });
  readonly breakpoints = input<Record<string, string> | undefined>(undefined);
  readonly class = input('', { alias: 'class' });

  readonly onShow = output<void>();
  readonly onHide = output<void>();
  readonly shown = output<void>();
  readonly hidden = output<void>();
  readonly maximize = output<{ maximized: boolean }>();

  protected readonly headerId = `med-dialog-header-${nextDeclarativeDialogId++}`;
  protected readonly maximized = signal(false);

  protected readonly panelClass = computed(() =>
    mergeClasses(
      'relative flex w-[calc(100vw-2rem)] max-h-[85vh] flex-col rounded-lg bg-surface-0 shadow-overlay-lg dark:bg-surface-800 sm:w-auto sm:min-w-[24rem] sm:max-w-lg',
      this.class(),
    ),
  );

  private handle: OverlayTemplateHandle<void> | null = null;

  constructor() {
    afterRenderEffect(() => {
      if (this.visible()) {
        this.open();
      } else {
        this.handle?.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  close(): void {
    this.visible.set(false);
  }

  protected toggleMaximize(): void {
    const next = !this.maximized();
    this.maximized.set(next);
    this.maximize.emit({ maximized: next });
  }

  private open(): void {
    if (this.handle) {
      return;
    }

    const handle = this.overlayService.openGlobalTemplate<void>(this.panelTemplate(), this.viewContainerRef, {
      position: this.position(),
      panelClass: [],
      hasBackdrop: this.modal(),
      closeOnEscape: this.closeOnEscape(),
      closeOnBackdropClick: this.dismissableMask(),
      closeOnOutsideClick: this.dismissableMask(),
    });
    this.handle = handle;
    this.onShow.emit();
    this.shown.emit();

    handle.closed$.subscribe(() => {
      this.handle = null;
      this.maximized.set(false);
      if (this.visible()) {
        this.visible.set(false);
      }
      this.onHide.emit();
      this.hidden.emit();
    });
  }
}
