import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  inject,
  output,
} from '@angular/core';

/**
 * Defers rendering of an embedded `ng-template` until its container enters the viewport.
 */
@Directive({
  selector: '[medDefer]',
  standalone: true,
})
export class DeferDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly elementRef = inject(ElementRef<Node>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Emits once when the deferred template is rendered. */
  readonly onLoad = output<void>();

  private loaded = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.load();
      return;
    }

    const observeTarget = this.elementRef.nativeElement.parentElement;
    if (!observeTarget) {
      this.load();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.load();
        observer.disconnect();
      }
    });

    observer.observe(observeTarget);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }

  private load(): void {
    if (this.loaded) {
      return;
    }

    this.loaded = true;
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.onLoad.emit();
  }
}

export const Defer = DeferDirective;
