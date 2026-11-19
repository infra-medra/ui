import { FocusTrap as CdkFocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Traps keyboard Tab navigation inside the host container using Angular CDK's `FocusTrapFactory`.
 */
@Directive({
  selector: '[medFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Enables or disables the focus trap via the directive attribute binding. */
  readonly medFocusTrap = input(true, { transform: booleanAttribute });
  /** Disabled flag; when true, disables the trap. */
  readonly pFocusTrapDisabled = input(false, { transform: booleanAttribute });
  /** Whether to move focus to the first focusable element inside the container when activated. */
  readonly autoFocus = input(true, { transform: booleanAttribute });

  private readonly isEnabled = computed(() => this.medFocusTrap() && !this.pFocusTrapDisabled());
  private focusTrap: CdkFocusTrap | null = null;
  private initialFocusApplied = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect(() => {
      const enabled = this.isEnabled();
      const trap = this.focusTrap ?? this.focusTrapFactory.create(this.elementRef.nativeElement);
      this.focusTrap = trap;
      trap.enabled = enabled;

      if (enabled && this.autoFocus() && !this.initialFocusApplied) {
        this.initialFocusApplied = true;
        void trap.focusInitialElementWhenReady();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.focusTrap?.destroy();
      this.focusTrap = null;
    });
  }
}

export const FocusTrap = FocusTrapDirective;
