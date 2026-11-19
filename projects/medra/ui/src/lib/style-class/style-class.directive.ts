import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';

/**
 * Directive that toggles or applies enter/leave CSS classes on a target element
 * resolved via relative tokens (`@next`, `@prev`, `@parent`, `@grandparent`) or CSS selector.
 */
@Directive({
  selector: '[medStyleClass]',
  standalone: true,
})
export class StyleClassDirective {
  readonly medStyleClass = input<string | undefined>(undefined);
  readonly enterFromClass = input<string | undefined>(undefined);
  readonly enterActiveClass = input<string | undefined>(undefined);
  readonly enterToClass = input<string | undefined>(undefined);
  readonly leaveFromClass = input<string | undefined>(undefined);
  readonly leaveActiveClass = input<string | undefined>(undefined);
  readonly leaveToClass = input<string | undefined>(undefined);
  readonly hideOnOutsideClick = input<boolean>(false);
  readonly hideOnEscape = input<boolean>(false);
  readonly toggleClass = input<string | undefined>(undefined);
  readonly trigger = input<'click' | 'hover'>('click');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private active = false;
  private triggerUnlistens: Array<() => void> = [];
  private globalUnlistens: Array<() => void> = [];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTriggerListeners();
      this.clearGlobalListeners();
    });

    effect(() => {
      const mode = this.trigger();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.clearTriggerListeners();
      const host = this.el.nativeElement;

      if (mode === 'hover') {
        this.triggerUnlistens.push(
          this.renderer.listen(host, 'mouseenter', () => this.enter()),
          this.renderer.listen(host, 'mouseleave', () => this.leave()),
        );
      } else {
        this.triggerUnlistens.push(this.renderer.listen(host, 'click', () => this.toggle()));
      }
    });
  }

  private toggle(): void {
    const target = this.resolveTarget();
    if (!target) {
      return;
    }

    const toggleClasses = this.splitClasses(this.toggleClass());
    if (toggleClasses.length > 0) {
      const hasAny = toggleClasses.some((cls) => target.classList.contains(cls));
      if (hasAny) {
        this.leaveTarget(target);
      } else {
        this.enterTarget(target);
      }
      return;
    }

    if (this.active) {
      this.leaveTarget(target);
    } else {
      this.enterTarget(target);
    }
  }

  private enter(): void {
    const target = this.resolveTarget();
    if (target) {
      this.enterTarget(target);
    }
  }

  private leave(): void {
    const target = this.resolveTarget();
    if (target) {
      this.leaveTarget(target);
    }
  }

  private enterTarget(target: Element): void {
    this.active = true;
    const toggleClasses = this.splitClasses(this.toggleClass());
    for (const cls of toggleClasses) {
      this.renderer.addClass(target, cls);
    }

    for (const cls of this.splitClasses(this.leaveFromClass())) {
      this.renderer.removeClass(target, cls);
    }
    for (const cls of this.splitClasses(this.leaveActiveClass())) {
      this.renderer.removeClass(target, cls);
    }
    for (const cls of this.splitClasses(this.leaveToClass())) {
      this.renderer.removeClass(target, cls);
    }

    for (const cls of this.splitClasses(this.enterFromClass())) {
      this.renderer.removeClass(target, cls);
    }
    for (const cls of this.splitClasses(this.enterActiveClass())) {
      this.renderer.addClass(target, cls);
    }
    for (const cls of this.splitClasses(this.enterToClass())) {
      this.renderer.addClass(target, cls);
    }

    this.bindGlobalListeners(target);
  }

  private leaveTarget(target: Element): void {
    this.active = false;
    const toggleClasses = this.splitClasses(this.toggleClass());
    for (const cls of toggleClasses) {
      this.renderer.removeClass(target, cls);
    }

    for (const cls of this.splitClasses(this.enterActiveClass())) {
      this.renderer.removeClass(target, cls);
    }
    for (const cls of this.splitClasses(this.enterToClass())) {
      this.renderer.removeClass(target, cls);
    }

    for (const cls of this.splitClasses(this.leaveFromClass())) {
      this.renderer.removeClass(target, cls);
    }
    for (const cls of this.splitClasses(this.leaveActiveClass())) {
      this.renderer.addClass(target, cls);
    }
    for (const cls of this.splitClasses(this.leaveToClass())) {
      this.renderer.addClass(target, cls);
    }

    this.clearGlobalListeners();
  }

  private bindGlobalListeners(target: Element): void {
    this.clearGlobalListeners();
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.hideOnOutsideClick()) {
      this.globalUnlistens.push(
        this.renderer.listen(this.document, 'click', (event: Event) => {
          const eventTarget = event.target as Node | null;
          if (!eventTarget) {
            return;
          }
          const host = this.el.nativeElement;
          if (!host.contains(eventTarget) && !target.contains(eventTarget)) {
            this.leaveTarget(target);
          }
        }),
      );
    }

    if (this.hideOnEscape()) {
      this.globalUnlistens.push(
        this.renderer.listen(this.document, 'keydown', (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            this.leaveTarget(target);
          }
        }),
      );
    }
  }

  private resolveTarget(): Element | null {
    const selector = this.medStyleClass()?.trim();
    if (!selector) {
      return null;
    }

    const host = this.el.nativeElement;
    switch (selector) {
      case '@next':
        return host.nextElementSibling;
      case '@prev':
        return host.previousElementSibling;
      case '@parent':
        return host.parentElement;
      case '@grandparent':
        return host.parentElement?.parentElement ?? null;
      default:
        try {
          return this.document.querySelector(selector);
        } catch {
          return null;
        }
    }
  }

  private splitClasses(value: string | undefined): string[] {
    if (!value) {
      return [];
    }
    return value.trim().split(/\s+/).filter(Boolean);
  }

  private clearTriggerListeners(): void {
    for (const unlisten of this.triggerUnlistens) {
      unlisten();
    }
    this.triggerUnlistens = [];
  }

  private clearGlobalListeners(): void {
    for (const unlisten of this.globalUnlistens) {
      unlisten();
    }
    this.globalUnlistens = [];
  }
}
