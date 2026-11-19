import { DestroyRef, Directive, ElementRef, Renderer2, booleanAttribute, computed, effect, inject, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { RippleDirective } from '../ripple/ripple.directive';
import { ButtonSeverity, ButtonSize, ButtonStyleVariant, INVALID_RING_CLASS, PLAIN_CLASS, RAISED_CLASS, SOLID_SEVERITY_BG, buttonVariants } from './button.styles';

/**
 * Button primitive (Trilha 3, pilot component #1). Implemented as an
 * attribute directive on a native `<button>`/`<a>` rather than a wrapping
 * component, so consumers keep native semantics for free (submit/reset
 * types, the native `disabled` attribute and its `:disabled` CSS pseudo,
 * anchor `href` navigation) and full control over content via normal
 * projection — no `label`/`icon` string inputs to keep in sync.
 *
 * That same "no template of its own" shape is also why `badge`/`badgeSeverity`
 * isn't implemented here:
 * a directive can't inject a badge element the way `loading`'s own doc
 * comment already explains it can't inject a spinner. Already fully
 * solved by projection, without any new input — `<button medButton><med-badge>3</med-badge></button>`.
 */
@Directive({
  selector: 'button[medButton], a[medButton]',
  standalone: true,
  hostDirectives: [{ directive: RippleDirective, inputs: ['medRippleDisabled'] }],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    // Wave 2 a11y fix: `loading` previously only dimmed the button and set
    // `pointer-events-none`, which blocks a *mouse* click (mousedown never
    // fires through a pointer-events-none element, so click never follows)
    // but not a *keyboard*-triggered activation — pressing Enter/Space on a
    // focused button is its own separate "activation behavior" per the HTML
    // spec, entirely independent of pointer events, that synthesizes a
    // `click` as the default action of the key event. Calling
    // `preventDefault()` on that keydown/keyup is the spec-correct way to
    // cancel that default action, so it's cancelled regardless of listener
    // registration order (unlike `stopPropagation`, `preventDefault` is only
    // checked once after every listener for the event has run). Deliberately
    // not the native `disabled` attribute/property: that's already entirely
    // consumer-managed via a plain `[disabled]` binding directly on the
    // native `<button>`/`<a>` (this directive has no `disabled` input of its
    // own), and writing to the same DOM property from a host binding as well
    // would race with — and can clobber — that binding on every
    // change-detection pass.
    '(keydown)': 'onHostKeydown($event)',
  },
})
export class ButtonDirective {
  // `protected`, not `private` — referenced from the `[attr.aria-disabled]` host binding
  // above, which Angular's template type-checker treats like any other template access.

  readonly severity = input<ButtonSeverity>('primary');
  readonly variant = input<ButtonStyleVariant>('filled');
  readonly size = input<ButtonSize>('default');
  readonly pill = input(false, { transform: booleanAttribute });
  /** Square padding matching the button's height, for icon-only buttons (e.g. a close button). */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Error/validation state — a danger ring on top of whatever severity/variant is already set, same treatment ToggleButton/SelectButton already used. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Busy state: sets `aria-busy` and dims/disables pointer interaction, the
   * same visual treatment as the native `disabled` state. Does **not**
   * render a spinner — `ButtonDirective` is a plain attribute directive on
   * a consumer-authored `<button>`/`<a>` (no template of its own), so it
   * has no way to inject content. Project a `<med-progress-spinner>`
   * yourself alongside the label when `loading` is true; a full built-in
   * spinner would need Button to become a wrapping component instead — a
   * breaking API change, not made here.
   */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Elevation (shadow), independent of severity/variant — e.g. a primary action floating above dense content. */
  readonly raised = input(false, { transform: booleanAttribute });
  /** Forces the neutral/gray ("secondary" severity) treatment regardless of `severity` — for de-emphasized actions that still need a specific variant (e.g. an outlined "plain" button next to a colored one). */
  readonly plain = input(false, { transform: booleanAttribute });
  /** Optional inline badge label rendered inside the host button via Renderer2. */
  readonly badge = input<string | undefined>(undefined);
  /** Severity color of the inline badge when `badge` is non-empty. */
  readonly badgeSeverity = input<ButtonSeverity>('secondary');
  /** Stretches the button to 100% of its container width. */
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private badgeEl: HTMLSpanElement | null = null;

  constructor() {
    effect(() => {
      const value = this.badge()?.trim();
      const severity = this.badgeSeverity();
      if (!value) {
        this.removeBadge();
        return;
      }

      if (!this.badgeEl) {
        this.badgeEl = this.renderer.createElement('span') as HTMLSpanElement;
        this.renderer.setAttribute(this.badgeEl, 'data-med-button-badge', '');
        this.renderer.appendChild(this.el.nativeElement, this.badgeEl);
      }

      const textClass = severity === 'contrast' ? 'text-surface-0 dark:text-surface-950' : 'text-white';
      this.renderer.setAttribute(
        this.badgeEl,
        'class',
        mergeClasses(
          'inline-flex items-center justify-center rounded-full px-1.5 min-w-5 h-5 text-xs font-semibold leading-none',
          SOLID_SEVERITY_BG[severity],
          textClass,
        ),
      );
      this.badgeEl.textContent = value;
    });

    this.destroyRef.onDestroy(() => this.removeBadge());
  }

  private removeBadge(): void {
    if (this.badgeEl) {
      this.renderer.removeChild(this.el.nativeElement, this.badgeEl);
      this.badgeEl = null;
    }
  }

  /** Cancels the Enter/Space "synthetic click" activation behavior while `loading` is true — see the `(keydown)` host binding comment for why this, and not `disabled`, is the fix. */
  protected onHostKeydown(event: Event): void {
    if (this.loading() && event instanceof KeyboardEvent && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
  }

  protected readonly hostClass = computed(() =>
    mergeClasses(
      buttonVariants({
        severity: this.severity(),
        variant: this.variant(),
        size: this.size(),
        pill: this.pill(),
        iconOnly: this.iconOnly(),
      }),
      this.invalid() ? INVALID_RING_CLASS : '',
      this.raised() ? RAISED_CLASS : '',
      this.plain() ? PLAIN_CLASS[this.variant()] : '',
      this.fluid() ? 'w-full' : '',
      this.loading() ? 'pointer-events-none opacity-(--opacity-disabled)' : '',
      this.class(),
    ),
  );
}
