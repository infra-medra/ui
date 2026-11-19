import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/** Accepted class binding types for ClassNamesDirective. */
export type ClassNamesValue =
  | string
  | string[]
  | Record<string, boolean | null | undefined>
  | null
  | undefined;

const PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Directive that declaratively merges dynamic classes (string, array, or object map)
 * with the host element's static classes using `mergeClasses`.
 */
@Directive({
  selector: '[medClassNames]',
  standalone: true,
})
export class ClassNamesDirective {
  readonly medClassNames = input<ClassNamesValue>(undefined);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly initialStaticClass: string;

  constructor() {
    this.initialStaticClass = this.el.nativeElement.className ?? '';

    effect(() => {
      const value = this.medClassNames();
      const dynamicClass = this.normalizeValue(value);
      const merged = mergeClasses(this.initialStaticClass, dynamicClass);
      this.renderer.setProperty(this.el.nativeElement, 'className', merged);
    });
  }

  private normalizeValue(value: ClassNamesValue): string | string[] {
    if (!value) {
      return '';
    }
    if (typeof value === 'string' || Array.isArray(value)) {
      return value;
    }

    const result: string[] = [];
    for (const key of Object.keys(value)) {
      if (PROTOTYPE_KEYS.has(key)) {
        continue;
      }
      if (value[key]) {
        result.push(key);
      }
    }
    return result;
  }
}
