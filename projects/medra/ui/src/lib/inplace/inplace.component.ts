import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, afterRenderEffect, booleanAttribute, computed, contentChild, input, model, output, viewChild } from '@angular/core';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { InplaceContentDirective, InplaceDisplayDirective } from './inplace.directives';

/**
 * Inplace primitive (Tier 3): click-to-edit toggle between a compact
 * display view and a richer content view (typically a form control),
 * `<med-inplace><span medInplaceDisplay>{{ value }}</span><input
 * medInplaceContent [(ngModel)]="value" /></med-inplace>`. Two named
 * content-projection slots (`InplaceDisplayDirective`/`InplaceContentDirective`,
 * same trivial marker-directive shape as Card's header/footer — see that
 * file's doc) rather than one default + one named slot: the two views are
 * mutually exclusive by construction, so there's no "leftover" content that
 * would need a catch-all `<ng-content>`.
 *
 * The display view is a real `<button>` (not a `div role="button"`
 * reimplementation) — unlike Select's clear affordance, there's no need to
 * nest another interactive element inside it, so a native button gets
 * Enter/Space activation and focus styling for free. Both views stay in the
 * DOM (`[hidden]`, not `@if`), same reasoning `PanelComponent` already
 * documents for its own collapsible body: a `medInplaceContent` form
 * control (e.g. an `<input>`) keeps whatever the consumer typed across a
 * close/reopen instead of losing it to re-instantiation.
 *
 * `active` is a `model()` (`[(active)]`) — local UI state, not a value the
 * consumer submits, same precedent `PanelComponent.collapsed`/
 * `DrawerComponent.visible` already established. `closable` adds a small
 * close button inside the content view for convenience; there's no
 * auto-close on blur or Enter — same "reacts to whatever the consumer's own
 * UI drives" scope cut already applied to FileUpload/DataView/Toast, since
 * this component can't know whether the consumer's content is a
 * single-field edit (Enter = done) or something with its own internal focus
 * moves (a dropdown, a multi-field form) where guessing "done editing"
 * would be wrong.
 *
 * `class` sizes the host, not either inner view directly — the display
 * button and the content div are mutually exclusive (only one is ever
 * visible), so there's no single one of them a consumer's width/margin
 * class unambiguously belongs to; the host is the one element always
 * present. Also sidesteps the same static-`class`-leaks-to-host issue
 * `ScrollPanel`'s own doc describes: routing `class` only to an inner view
 * while the host stayed bare would have put the same class on both anyway,
 * just via two different, uncoordinated paths.
 */
@Component({
  selector: 'med-inplace',
  standalone: true,
  imports: [NgTemplateOutlet, ButtonDirective, IconComponent, InplaceDisplayDirective, InplaceContentDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: `
    <button #displayButton type="button" [hidden]="active()" [disabled]="effectiveDisabled()" [attr.aria-expanded]="active()" [class]="displayClass()" (click)="open($event)">
      <ng-content select="[medInplaceDisplay]" />
    </button>
    <div [hidden]="!active()" [class]="contentClass">
      <div #contentWrapper class="min-w-0 flex-1" tabindex="-1">
        <ng-content select="[medInplaceContent]" />
        @if (contentTemplate(); as tpl) {
          <ng-container *ngTemplateOutlet="tpl; context: contentTemplateContext" />
        }
      </div>
      @if (closable()) {
        <button
          medButton
          type="button"
          variant="text"
          severity="secondary"
          iconOnly
          class="size-7 shrink-0 p-1"
          [attr.aria-label]="closeLabel()"
          (click)="close($event)"
        >
          <med-icon name="x-mark" variant="mini" />
        </button>
      }
    </div>
  `,
})
export class InplaceComponent {
  readonly active = model(false);
  readonly closable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly preventClick = input(false, { transform: booleanAttribute });

  readonly activate = output<Event | void>();
  readonly deactivate = output<Event | void>();

  protected readonly contentTemplate = contentChild<TemplateRef<{ closeCallback: () => void }>>('content');
  protected readonly contentTemplateContext = { closeCallback: () => this.close() };
  protected readonly effectiveDisabled = computed(() => this.disabled());

  /** Default is English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly closeLabel = input('Close');
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => mergeClasses('block', this.class()));

  protected readonly displayClass = computed(() =>
    mergeClasses(
      'block w-full rounded-md px-2 py-1 text-left transition-colors duration-(--transition-duration-base)',
      'hover:bg-surface-100 dark:hover:bg-surface-800',
      'focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:focus-visible:ring-brand-400',
      'disabled:pointer-events-none disabled:opacity-(--opacity-disabled)',
      'cursor-pointer',
    ),
  );
  protected readonly contentClass = 'flex items-start gap-1';

  private readonly displayButtonRef = viewChild.required<ElementRef<HTMLButtonElement>>('displayButton');
  private readonly contentWrapperRef = viewChild.required<ElementRef<HTMLElement>>('contentWrapper');
  private wasActive = false;

  constructor() {
    // Focus management (Wave 2 fix): opening had no focus handoff at all —
    // the just-hidden display button silently dropped focus to <body> for
    // keyboard users, with no way to tell the content view had opened.
    // `afterRenderEffect`, not a plain `effect()`, for the same "wait for
    // the DOM to actually reflect the new `active` value before touching
    // it" reasoning `TerminalComponent`'s own scroll-into-view already
    // documents — `[hidden]` has to have actually flipped before a focus()
    // call on either side would land on a visible, focusable element.
    afterRenderEffect(() => {
      const active = this.active();
      if (active === this.wasActive) {
        return;
      }
      this.wasActive = active;
      if (active) {
        const wrapper = this.contentWrapperRef().nativeElement;
        const focusable = wrapper.querySelector<HTMLElement>(
          'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])',
        );
        (focusable ?? wrapper).focus();
      } else {
        this.displayButtonRef().nativeElement.focus();
      }
    });
  }

  protected open(event?: Event): void {
    if (this.preventClick()) {
      return;
    }
    this.active.set(true);
    this.activate.emit(event);
  }

  protected close(event?: Event): void {
    this.active.set(false);
    this.deactivate.emit(event);
  }
}
