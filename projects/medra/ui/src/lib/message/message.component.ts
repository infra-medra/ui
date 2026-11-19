import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';
import { mergeClasses } from '../utils/merge-classes';
import {
  MESSAGE_CLOSE_ICON_SIZE_CLASS,
  MESSAGE_ICON_SIZE_CLASS,
  MESSAGE_SEVERITY_ICON,
  MESSAGE_SEVERITY_ICON_CLASS,
  MessageSeverity,
  MessageSize,
  messageCardVariants,
} from './message.styles';

/**
 * Inline, static status message (Trilha 3, pilot #5 — the non-ephemeral half
 * of "Message/Toast"). Purely presentational: it doesn't track its own
 * visibility — closing emits `(closed)` and the consumer decides whether to
 * remove it from their template. Toast reuses the same severity card style
 * (and this same component directly — `toast-container.component.ts` renders
 * one `<med-message>` per stacked toast), so `role`/`aria-live` are computed
 * from `severity()` rather than fixed: `danger` escalates to `role="alert"` /
 * `aria-live="assertive"` (an error needs more urgent announcement than a
 * routine status update), every other severity stays `role="status"` /
 * `aria-live="polite"`. This is what gives error-severity toasts their
 * assertive treatment — a live-region's politeness is resolved by the
 * nearest ancestor that declares one, so the escalation has to live on this
 * component's own host (the innermost element), not on a wrapper in the
 * toast container.
 *
 * **`icon`/`size`/`life`**. `icon` overrides the severity-derived default (`MESSAGE_SEVERITY_ICON`)
 * icon-font class string rendered on a bare `<i>`; uses this library's own icon system, an
 * `IconComponent` `name` string, same convention Accordion's `expandIcon`/`collapseIcon` and
 * DataView's `loadingIcon` already established. `size` (`sm`/`default`/`lg`) matches The reference
 * library's own two extra sizes (`small`/`large` there — renamed to this library's existing
 * `sm`/`default`/`lg` scale, same as Button/ProgressBar).
 *
 * `life` (auto-dismiss after N ms) can't reach into an internal visibility signal, because — per
 * this component's own "purely presentational" contract above — there isn't one: adapted to emit
 * `(closed)` automatically once `life` elapses, the exact same event the close button emits, so a
 * consumer only ever needs the one `(closed)` handler regardless of which triggered it. Same
 * `effect()`-plus-`onCleanup()` shape `TooltipDirective`'s `hideOnEscape` already uses for a
 * reactive, auto-torn-down side effect (here a `setTimeout` instead of a `document` listener) —
 * `Toast` already has its own, separate `life` timer at the container level
 * (`ToastContainerComponent`, predates this item); this is the same capability for `Message` used
 * directly, not projected through Toast.
 */
@Component({
  selector: 'med-message',
  standalone: true,
  imports: [IconComponent, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', '[attr.role]': 'roleAttr()', '[attr.aria-live]': 'ariaLiveAttr()' },
  template: `
    <div [class]="cardClass()">
      <med-icon [name]="iconName()" variant="solid" [class]="iconClass()" />
      <div class="flex-1"><ng-content /></div>
      @if (closable()) {
        <button
          medButton
          type="button"
          variant="text"
          severity="secondary"
          iconOnly
          class="size-6 p-1"
          [attr.aria-label]="closeLabel()"
          (click)="closed.emit()"
        >
          <med-icon name="x-mark" [class]="closeIconClass()" />
        </button>
      }
    </div>
  `,
})
export class MessageComponent {
  readonly severity = input<MessageSeverity>('info');
  readonly closable = input(false, { transform: booleanAttribute });
  /** Default: `'Close'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly closeLabel = input('Close');
  readonly class = input('', { alias: 'class' });
  /** Overrides the severity-derived default icon (an `IconComponent` name). */
  readonly icon = input<string | null>(null);
  readonly size = input<MessageSize>('default');
  /** Milliseconds until this message auto-emits `(closed)`; `null` (default) never auto-closes. */
  readonly life = input<number | null>(null);

  readonly closed = output<void>();

  protected readonly cardClass = computed(() =>
    mergeClasses(messageCardVariants({ severity: this.severity(), size: this.size() }), this.class()),
  );
  protected readonly iconName = computed(() => this.icon() ?? MESSAGE_SEVERITY_ICON[this.severity()]);
  protected readonly iconClass = computed(
    () => `${MESSAGE_ICON_SIZE_CLASS[this.size()]} shrink-0 ${MESSAGE_SEVERITY_ICON_CLASS[this.severity()]}`,
  );
  protected readonly closeIconClass = computed(() => MESSAGE_CLOSE_ICON_SIZE_CLASS[this.size()]);
  protected readonly roleAttr = computed(() => (this.severity() === 'danger' ? 'alert' : 'status'));
  protected readonly ariaLiveAttr = computed(() => (this.severity() === 'danger' ? 'assertive' : 'polite'));

  constructor() {
    effect((onCleanup) => {
      const life = this.life();
      if (!life || life <= 0) {
        return;
      }
      const timer = setTimeout(() => this.closed.emit(), life);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
